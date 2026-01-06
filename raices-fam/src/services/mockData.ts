import type { Person } from '../types/person';
import { listImageFiles, ensurePersonFolder } from './driveService';

const STORAGE_KEY = 'raices_family_data';

// Helper to get all people
const getStoredPeople = (): Record<string, Person> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
};

// Helper to save all people
const saveStoredPeople = (people: Record<string, Person>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
};

// Initialize with MOCK_PERSON if empty
const initializeStorage = () => {
    const people = getStoredPeople();
    if (Object.keys(people).length === 0) {
        const abuelo: Person = {
            id: '1',
            firstName: 'Abuelo',
            lastName: 'Ejemplo',
            gender: 'MALE',
            isLiving: true,
            birth: {
                id: 'birth_1',
                type: 'BIRTH',
                date: { display: '1920', year: 1920 },
                location: { name: 'Ciudad de México, México' },
            },
            relationships: [
                { id: 'rel_1', personId: '2', type: 'SPOUSE' }
            ],
            media: [],
            createdBy: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const abuela: Person = {
            id: '2',
            firstName: 'Abuela',
            lastName: 'Ejemplo',
            gender: 'FEMALE',
            isLiving: true,
            birth: {
                id: 'birth_2',
                type: 'BIRTH',
                date: { display: '1922', year: 1922 },
                location: { name: 'Guadalajara, México' },
            },
            relationships: [
                { id: 'rel_2', personId: '1', type: 'SPOUSE' }
            ],
            media: [],
            createdBy: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        people[abuelo.id] = abuelo;
        people[abuela.id] = abuela;
        saveStoredPeople(people);
    }
    return people;
};

// Ensure storage is initialized
export const MOCK_PERSON = initializeStorage()['1'];

// Track pending folder creations to prevent duplicates (Race Condition Fix)
const pendingFolderCreations = new Map<string, Promise<string>>();

export const getPersonById = async (id: string): Promise<Person | undefined> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const people = getStoredPeople();
    let person = people[id];

    if (person) {
        try {
            const rootFolderId = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;
            if (rootFolderId) {
                // 1. Ensure person has a dedicated folder
                if (!person.driveFolderId) {
                    let creationPromise: Promise<string>;

                    // Check if we are already creating a folder for this person
                    if (!pendingFolderCreations.has(person.id)) {
                        const personName = `${person.firstName} ${person.lastName}`;
                        creationPromise = ensurePersonFolder(personName, person.id, rootFolderId)
                            .then(async (folderId) => {
                                // Update person with new folder ID
                                // Note: 'person' here refers to the 'let person' from the outer scope.
                                // This update will be reflected in the current execution path.
                                const updatedPerson = { ...person, driveFolderId: folderId };
                                await updatePerson(updatedPerson); // Persist the updated person
                                console.log(`Assigned new Drive folder for ${personName}: ${folderId}`);
                                return folderId;
                            })
                            .finally(() => {
                                pendingFolderCreations.delete(person.id);
                            });

                        pendingFolderCreations.set(person.id, creationPromise);
                    } else {
                        // If a creation is already pending, retrieve its promise
                        creationPromise = pendingFolderCreations.get(person.id)!;
                    }

                    // Wait for the pending creation (whether we started it or someone else did)
                    const folderId = await creationPromise;
                    if (folderId && person.driveFolderId !== folderId) {
                        // Update the local 'person' variable if it was not already updated by the promise's .then()
                        person = { ...person, driveFolderId: folderId };
                    }
                }

                // 2. Fetch images from THEIR specific folder
                if (person.driveFolderId) {
                    const driveImages = await listImageFiles(person.driveFolderId);
                    const driveMedia = driveImages.map(file => {
                        const imageUrl = file.thumbnailLink || file.webContentLink || '';
                        return {
                            id: file.id,
                            type: 'IMAGE' as const,
                            url: imageUrl,
                            thumbnailUrl: imageUrl,
                            title: file.name
                        };
                    });

                    if (driveMedia.length > 0) {
                        return { ...person, media: driveMedia };
                    }
                }
            }
        } catch (error) {
            console.warn('Could not fetch Drive images:', error);
        }
        return person;
    }

    return undefined;
};

export const updatePerson = async (person: Person): Promise<Person> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const people = getStoredPeople();
    people[person.id] = person;
    saveStoredPeople(people);

    return person;
};

export const createPerson = async (person: Person): Promise<Person> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const people = getStoredPeople();
    people[person.id] = person;
    saveStoredPeople(people);

    return person;
};

export const deletePerson = async (id: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const people = getStoredPeople();
    delete people[id];
    saveStoredPeople(people);
};

export const getAllPeople = async (): Promise<Person[]> => {
    const people = getStoredPeople();
    return Object.values(people);
};
