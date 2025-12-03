import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native';
import { Contact, getInitials } from '../../Services';

interface ContactListItemProps {
    contact: Contact;
    onPress: (contact: Contact) => void;
    searchQuery?: string;
    onLongPress?: (contact: Contact) => void;
}

export const ContactListItem: React.FC<ContactListItemProps> = ({ contact, onPress, searchQuery, onLongPress }) => {

    const renderHighlightedText = (text: string, query: string) => {
        if (!query.trim()) {
            return <Text style={styles.name}>{text}</Text>;
        }

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <Text style={styles.name}>
                {parts.map((part, index) => 
                    part.toLowerCase() === query.toLowerCase() ? (
                        <Text key={index} style={styles.highlight}>{part}</Text>
                    ) : (
                        <Text key={index}>{part}</Text>
                    )
                )}
            </Text>
        );
    };

    return (
        <TouchableOpacity 
            style={styles.container}
            onPress={() => onPress(contact)}
            onLongPress={() => onLongPress?.(contact)}
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
            {renderHighlightedText(contact.name, searchQuery || '')}
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
    highlight: {
        backgroundColor: '#FFEB3B',
        fontWeight: '700',
    },
});
