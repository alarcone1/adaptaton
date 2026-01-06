export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';

export interface DateInfo {
    day?: number;
    month?: number;
    year?: number;
    display: string; // "12 de Enero de 1980" or "1980"
}

export interface Location {
    name: string;
    lat?: number;
    lng?: number;
    placeId?: string; // Google Maps Place ID
}

export interface Event {
    id: string;
    type: 'BIRTH' | 'DEATH' | 'MARRIAGE' | 'DIVORCE' | 'IMMIGRATION' | 'OTHER';
    date?: DateInfo;
    location?: Location;
    description?: string;
    mediaIds?: string[];
}

export interface Media {
    id: string;
    type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
    url: string;
    thumbnailUrl?: string;
    title?: string;
    date?: DateInfo;
    description?: string;
}

export interface Relationship {
    id: string;
    personId: string; // The other person in the relationship
    type: 'FATHER' | 'MOTHER' | 'SPOUSE' | 'CHILD' | 'SIBLING';
    status?: 'CURRENT' | 'FORMER'; // For spouses: CURRENT = Active, FORMER = Ex/Divorced
}

export interface Person {
    id: string;
    firstName: string;
    lastName: string;
    maidenName?: string; // Apellido de soltera
    gender: Gender;

    // Main Events
    birth?: Event;
    death?: Event;

    // Biography
    bio?: string;

    // Relationships
    relationships: Relationship[];

    // Media
    profilePhotoUrl?: string;
    coverPhotoUrl?: string;
    driveFolderId?: string; // ID of the specific Drive folder for this person
    media: Media[];

    // Metadata
    isLiving: boolean;
    createdBy: string; // User ID
    createdAt: string; // ISO Date
    updatedAt: string; // ISO Date
}
