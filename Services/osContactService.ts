import * as Contacts from 'expo-contacts';
import { Contact } from './types';
import { generateUUID } from './contactService';

/**
 * Request permission to access device contacts
 */
export const requestContactsPermission = async (): Promise<boolean> => {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === 'granted';
};

/**
 * Import contacts from device OS
 */
export const importOSContacts = async (): Promise<Contact[]> => {
    const hasPermission = await requestContactsPermission();
    
    if (!hasPermission) {
        throw new Error('Permission to access contacts was denied');
    }

    const { data } = await Contacts.getContactsAsync({
        fields: [
            Contacts.Fields.Name,
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Image,
        ],
    });

    // Convert OS contacts to our Contact format
    const importedContacts: Contact[] = data
        .filter(osContact => {
            // Only import contacts with a name and at least one phone number
            return osContact.name && osContact.phoneNumbers && osContact.phoneNumbers.length > 0;
        })
        .map(osContact => {
            // Get first phone number and clean it (remove non-numeric characters)
            const firstPhone = osContact.phoneNumbers![0];
            const cleanedPhone = (firstPhone.number || firstPhone.digits || '').replace(/\D/g, '');
            
            // Only import if we have a 7-digit phone number
            if (cleanedPhone.length !== 7) {
                return null;
            }

            return {
                id: generateUUID(),
                name: osContact.name!,
                phoneNumber: cleanedPhone,
                photo: osContact.image?.uri || null,
            };
        })
        .filter((contact): contact is Contact => contact !== null);

    return importedContacts;
};
