import { Contact } from './types';
import { loadAllContacts } from './contactService';

/**
 * Check if a contact with the given phone number already exists
 * Returns the existing contact if found, null otherwise
 */
export const findContactByPhoneNumber = async (phoneNumber: string): Promise<Contact | null> => {
    const allContacts = await loadAllContacts();
    return allContacts.find(c => c.phoneNumber === phoneNumber) || null;
};

/**
 * Check if a contact with the given name already exists
 * Returns the existing contact if found, null otherwise
 */
export const findContactByName = async (name: string): Promise<Contact | null> => {
    const allContacts = await loadAllContacts();
    const normalizedName = name.trim().toLowerCase();
    return allContacts.find(c => c.name.trim().toLowerCase() === normalizedName) || null;
};
