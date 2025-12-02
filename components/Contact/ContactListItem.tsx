import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native';
import { Contact } from '../../Services';

interface ContactListItemProps {
    contact: Contact;
    onPress: (contact: Contact) => void;
}

export const ContactListItem: React.FC<ContactListItemProps> = ({ contact, onPress }) => {
    const getInitials = (name: string): string => {
        const parts = name.trim().split(' ').filter(part => part.length > 0);
        return parts.map(part => part[0]).join('').toUpperCase();
    };

    return (
        <TouchableOpacity 
            style={styles.container}
            onPress={() => onPress(contact)}
        >
            {contact.photo ? (
                <Image
                    source={{ uri: contact.photo }}
                    style={styles.thumbnail}
                />
            ) : (
                <View style={styles.placeholder}>
                    <Text style={styles.initials}>{getInitials(contact.name)}</Text>
                </View>
            )}
            <Text style={styles.name}>{contact.name}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
        backgroundColor: '#ccc',
    },
    placeholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    name: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
});
