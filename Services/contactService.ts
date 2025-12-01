import { Paths, Directory, File } from 'expo-file-system';
import { Contact } from './types';

/**
 * Get the contacts directory
 */
const getContactsDir = (): Directory => {
    return new Directory(Paths.document, 'contacts');
};

/**
 * Initialize the contacts directory if it doesn't exist
 */
export const initializeContactsDirectory = async (): Promise<void> => {
    const contactsDir = getContactsDir();
    if (!contactsDir.exists) {
        await contactsDir.create();
    }
};

/**
 * Generate a filename for a contact based on name and UUID
 */
const generateContactFilename = (name: string, uuid: string): string => {
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-');
    return `${sanitizedName}-${uuid}.json`;
};

/**
 * Save a contact to the file system
 */
export const saveContact = async (contact: Contact): Promise<void> => {
    await initializeContactsDirectory();
    const contactsDir = getContactsDir();
    const filename = generateContactFilename(contact.name, contact.id);
    const file = new File(contactsDir, filename);
    const contactData = JSON.stringify(contact, null, 4);
    await file.write(contactData);
};

/**
 * Load all contacts from the file system
 */
export const loadAllContacts = async (): Promise<Contact[]> => {
    await initializeContactsDirectory();
    const contactsDir = getContactsDir();
    const items = await contactsDir.list();
    const contacts: Contact[] = [];

    for (const item of items) {
        if (item instanceof File && item.name.endsWith('.json')) {
            const content = await item.text();
            const contact = JSON.parse(content) as Contact;
            contacts.push(contact);
        }
    }

    // Sort contacts alphabetically by name (ascending order)
    return contacts.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Load a single contact by ID
 */
export const loadContactById = async (id: string): Promise<Contact | null> => {
    const contacts = await loadAllContacts();
    return contacts.find(contact => contact.id === id) || null;
};

/**
 * Update an existing contact
 */
export const updateContact = async (contact: Contact): Promise<void> => {
    // Delete the old file first (in case the name changed)
    await deleteContact(contact.id);
    // Save the contact with new information
    await saveContact(contact);
};

/**
 * Delete a contact from the file system
 */
export const deleteContact = async (id: string): Promise<void> => {
    const contactsDir = getContactsDir();
    const items = await contactsDir.list();
    
    for (const item of items) {
        if (item instanceof File && item.name.includes(id) && item.name.endsWith('.json')) {
            await item.delete();
            break;
        }
    }
};

/**
 * Search contacts by name (case insensitive substring search)
 */
export const searchContacts = async (searchTerm: string): Promise<Contact[]> => {
    const allContacts = await loadAllContacts();
    
    if (!searchTerm.trim()) {
        return allContacts;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return allContacts.filter(contact => 
        contact.name.toLowerCase().includes(lowerSearchTerm)
    );
};

/**
 * Generate a UUID v4
 */
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
