interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    thumbnailLink?: string;
    webViewLink?: string;
    webContentLink?: string;
}

export const listImageFiles = async (folderId?: string): Promise<DriveFile[]> => {
    const token = localStorage.getItem('google_access_token');
    if (!token) throw new Error('No access token found');

    // Search for images, not trashed
    let query = "mimeType contains 'image/' and trashed = false";
    if (folderId) {
        query += ` and '${folderId}' in parents`;
    }

    const fields = 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink)';

    console.log('Fetching Drive files...');

    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=20`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Drive API Error:', response.status, errorText);
        throw new Error('Failed to fetch Drive files');
    }

    const data = await response.json();
    console.log('Drive Raw Data:', data);

    // Map to ensure we have a usable URL
    const files = data.files?.map((file: any) => {
        let thumbnailLink = file.thumbnailLink;

        if (thumbnailLink) {
            // Replace any existing size param (e.g., =s220, =s100) with =s1000
            // If no size param exists, append it
            if (thumbnailLink.includes('=s')) {
                thumbnailLink = thumbnailLink.replace(/=s\d+/, '=s1000');
            } else {
                thumbnailLink += '=s1000';
            }
        } else {
            // Fallback to a direct content link if thumbnail is missing
            // Note: This might require auth headers if the file is private
            thumbnailLink = `https://lh3.googleusercontent.com/d/${file.id}=s1000?authuser=0`;
        }

        console.log(`Generated URL for ${file.name}:`, thumbnailLink);

        return {
            ...file,
            thumbnailLink
        };
    }) || [];

    return files;
};

// Create a new folder in Drive
export const createFolder = async (name: string, parentId?: string): Promise<string> => {
    const token = localStorage.getItem('google_access_token');
    if (!token) throw new Error('No access token found');

    const metadata: any = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentId) {
        metadata.parents = [parentId];
    }

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create folder:', response.status, errorText);
        throw new Error('Failed to create folder');
    }

    const file = await response.json();
    console.log('Folder created successfully:', file);
    return file.id;
};

// Search for a folder by name within a parent
export const searchFolder = async (name: string, parentId?: string): Promise<string | null> => {
    const token = localStorage.getItem('google_access_token');
    if (!token) throw new Error('No access token found');

    let query = `mimeType = 'application/vnd.google-apps.folder' and name = '${name}' and trashed = false`;
    if (parentId) {
        query += ` and '${parentId}' in parents`;
    }

    const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to search folder');
    }

    const data = await response.json();
    return data.files?.[0]?.id || null;
};

// Ensure a folder exists for a person (Find or Create)
export const ensurePersonFolder = async (personName: string, personId: string, rootFolderId: string): Promise<string> => {
    // Sanitize name for folder
    const safeName = personName.replace(/[^a-zA-Z0-9 ]/g, '').trim();
    const folderName = `${safeName}_${personId}`;

    // 1. Check if exists
    const existingId = await searchFolder(folderName, rootFolderId);
    if (existingId) return existingId;

    // 2. Create if not
    return await createFolder(folderName, rootFolderId);
};

// Upload a file to Drive
export const uploadFile = async (file: File, folderId: string): Promise<DriveFile> => {
    const token = localStorage.getItem('google_access_token');
    if (!token) throw new Error('No access token found');

    const metadata = {
        name: file.name,
        parents: [folderId],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,thumbnailLink,webViewLink,webContentLink', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: form,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to upload file:', response.status, errorText);
        throw new Error('Failed to upload file');
    }

    const data = await response.json();

    // Ensure we have a usable thumbnail link immediately
    let thumbnailLink = data.thumbnailLink;
    if (thumbnailLink) {
        if (thumbnailLink.includes('=s')) {
            thumbnailLink = thumbnailLink.replace(/=s\d+/, '=s1000');
        } else {
            thumbnailLink += '=s1000';
        }
    } else {
        thumbnailLink = `https://lh3.googleusercontent.com/d/${data.id}=s1000?authuser=0`;
    }

    return {
        ...data,
        thumbnailLink
    };
};

// Download a file's content as a Blob
export const downloadFile = async (fileId: string): Promise<Blob> => {
    const token = localStorage.getItem('google_access_token');
    if (!token) throw new Error('No access token found');

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to download file content');
    }

    return await response.blob();
};




// Delete a file from Drive (Trash it)
export const deleteFile = async (fileId: string): Promise<void> => {
    const token = localStorage.getItem('google_access_token');
    if (!token) throw new Error('No access token found');

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to delete file:', response.status, errorText);
        throw new Error('Failed to delete file');
    }
};
