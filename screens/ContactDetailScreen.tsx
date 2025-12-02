import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Contact, loadContactById, updateContact, deleteContact, formatPhoneNumber, validatePhoneNumber, cleanPhoneNumber } from '../Services';
import { ContactPhoto, ContactFormField } from '../components/Contact';

export default function ContactDetailScreen() {
    const { contactId, autoEdit } = useLocalSearchParams<{ contactId: string; autoEdit?: string }>();
    const [contact, setContact] = useState<Contact | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedPhoneNumber, setEditedPhoneNumber] = useState('');
    const [editedPhoto, setEditedPhoto] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handlePhoneChange = (text: string): void => {
        setEditedPhoneNumber(cleanPhoneNumber(text));
    };

    useEffect(() => {
        loadContact();
    }, [contactId]);

    const loadContact = async () => {
        if (!contactId) {
            return;
        }

        setIsLoading(true);
        try {
            const loadedContact = await loadContactById(contactId);
            if (loadedContact) {
                setContact(loadedContact);
                setEditedName(loadedContact.name);
                setEditedPhoneNumber(loadedContact.phoneNumber);
                setEditedPhoto(loadedContact.photo);
                // Auto-enter edit mode if autoEdit param is present
                if (autoEdit === 'true') {
                    setIsEditing(true);
                }
            }
        } catch (error) {
            console.error('Error loading contact:', error);
            Alert.alert('Error', 'Failed to load contact');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (contact) {
            setEditedName(contact.name);
            setEditedPhoneNumber(contact.phoneNumber);
            setEditedPhoto(contact.photo);
        }
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!contact || !editedName.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        if (!validatePhoneNumber(editedPhoneNumber)) {
            Alert.alert('Error', 'Invalid phone number.');
            return;
        }

        try {
            const updatedContact: Contact = {
                ...contact,
                name: editedName.trim(),
                phoneNumber: cleanPhoneNumber(editedPhoneNumber),
                photo: editedPhoto
            };
            await updateContact(updatedContact);
            setContact(updatedContact);
            setIsEditing(false);
            Alert.alert('Success', 'Contact updated successfully');
        } catch (error) {
            console.error('Error updating contact:', error);
            Alert.alert('Error', 'Failed to update contact');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Contact',
            'Are you sure you want to delete this contact?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (contact) {
                            try {
                                await deleteContact(contact.id);
                                router.back();
                            } catch (error) {
                                console.error('Error deleting contact:', error);
                                Alert.alert('Error', 'Failed to delete contact');
                            }
                        }
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    if (!contact) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Contact not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.photoSection}>
                    <ContactPhoto 
                        photo={contact.photo}
                        name={isEditing ? editedName : contact.name}
                        size={120}
                        showChangeButton={isEditing}
                    />
                </View>

                <View style={styles.infoContainer}>
                    <ContactFormField
                        label="Name"
                        value={isEditing ? editedName : contact.name}
                        isEditing={isEditing}
                        onChangeText={setEditedName}
                        placeholder="Enter name"
                        autoCapitalize="words"
                    />

                    <ContactFormField
                        label="Phone"
                        value={isEditing ? editedPhoneNumber : formatPhoneNumber(contact.phoneNumber)}
                        isEditing={isEditing}
                        onChangeText={handlePhoneChange}
                        placeholder="Enter phone number"
                        keyboardType="number-pad"
                        maxLength={8}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    {isEditing ? (
                        <>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleSave}
                            >
                                <Ionicons name="checkmark" size={20} color="#fff" />
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleCancel}
                            >
                                <Ionicons name="close" size={20} color="#666" />
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.button, styles.editButton]}
                                onPress={handleEdit}
                            >
                                <Ionicons name="pencil" size={20} color="#fff" />
                                <Text style={styles.buttonText}>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.deleteButton]}
                                onPress={handleDelete}
                            >
                                <Ionicons name="trash" size={20} color="#fff" />
                                <Text style={styles.buttonText}>Delete</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    photoSection: {
        paddingVertical: 32,
    },
    infoContainer: {
        padding: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    editButton: {
        backgroundColor: '#007AFF',
    },
    saveButton: {
        backgroundColor: '#34C759',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});
