import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, SafeAreaView, Alert, Modal } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Contact, loadAllContacts, searchContacts, saveContact, importOSContacts } from '../Services';
import { ContactListItem } from '../components/Contact';
import { SearchBar } from '../components/SearchBar';

export default function ContactsScreen() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);

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
        setMenuVisible(false);
        router.push('/add-contact');
    };

    // Import contacts from OS
    const handleImportContacts = async () => {
        setMenuVisible(false);
        try {
            const osContacts = await importOSContacts();
            
            if (osContacts.length === 0) {
                Alert.alert('No Contacts', 'No contacts with valid 7-digit phone numbers found on your device.');
                return;
            }

            // Get existing contacts to check for duplicates
            const existingContacts = await loadAllContacts();
            const existingPhones = new Set(existingContacts.map(c => c.phoneNumber));
            
            // Filter out duplicates (based on phone number)
            const newContacts = osContacts.filter(contact => !existingPhones.has(contact.phoneNumber));

            if (newContacts.length === 0) {
                Alert.alert('No New Contacts', 'All contacts from your device are already imported.');
                return;
            }

            // Save all new contacts
            let savedCount = 0;
            for (const contact of newContacts) {
                try {
                    await saveContact(contact);
                    savedCount++;
                } catch (error) {
                    console.error('Error saving contact:', error);
                }
            }

            const skippedCount = osContacts.length - savedCount;
            const message = skippedCount > 0 
                ? `Successfully imported ${savedCount} new contact(s). ${skippedCount} duplicate(s) skipped.`
                : `Successfully imported ${savedCount} contact(s) from your device.`;

            Alert.alert(
                'Import Successful',
                message,
                [{ text: 'OK', onPress: () => loadContacts() }]
            );
        } catch (error: any) {
            Alert.alert('Import Failed', error.message || 'Failed to import contacts from device');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholder="Search contacts..."
                    />
                </View>
                <TouchableOpacity 
                    style={styles.menuButton}
                    onPress={() => setMenuVisible(true)}
                >
                    <Ionicons name="menu" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <Modal
                visible={menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={handleAddContact}
                        >
                            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                            <Text style={styles.menuText}>Add Contact</Text>
                        </TouchableOpacity>

                        <View style={styles.menuDivider} />

                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={handleImportContacts}
                        >
                            <Ionicons name="download-outline" size={24} color="#34C759" />
                            <Text style={styles.menuText}>Import from Device</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12,
        gap: 8,
    },
    searchContainer: {
        flex: 1,
    },
    menuButton: {
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 60,
        paddingRight: 12,
    },
    menuContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        minWidth: 220,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        gap: 12,
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 12,
    },
    menuText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
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
});
