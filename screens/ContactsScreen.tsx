import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Contact, loadAllContacts, searchContacts } from '../Services';
import { ContactListItem } from '../components/Contact';
import { SearchBar } from '../components/SearchBar';

export default function ContactsScreen() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Load contacts on mount and when screen is focused
    const loadContacts = useCallback(async () => {
        setIsLoading(true);
        try {
            const loadedContacts = await loadAllContacts();
            setContacts(loadedContacts);
            setFilteredContacts(loadedContacts);
        } catch (error) {
            console.error('Error loading contacts:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Reload contacts whenever the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadContacts();
        }, [loadContacts])
    );

    // Handle search filter (case insensitive substring search)
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        try {
            const results = await searchContacts(query);
            setFilteredContacts(results);
        } catch (error) {
            console.error('Error searching contacts:', error);
        }
    };

    // Navigate to contact detail screen
    const handleContactPress = (contact: Contact) => {
        router.push({
            pathname: '/contact-detail',
            params: { contactId: contact.id }
        });
    };

    // Navigate to add contact screen
    const handleAddContact = () => {
        router.push('/add-contact');
    };

    return (
        <SafeAreaView style={styles.container}>
            <SearchBar
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Search contacts..."
            />

            <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ContactListItem 
                        contact={item} 
                        onPress={handleContactPress}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'No contacts found' : 'No contacts yet'}
                        </Text>
                    </View>
                }
            />

            <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddContact}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listContent: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});
