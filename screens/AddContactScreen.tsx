import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Text } from 'react-native';
import { router } from 'expo-router';
import { Contact, saveContact, generateUUID, validatePhoneNumber, cleanPhoneNumber, formatPhoneNumber, updateContact, findContactByPhoneNumber } from '../Services';
import { ContactPhoto, ContactFormField } from '../components/Contact';
import { Ionicons } from '@expo/vector-icons';

export default function AddContactScreen() {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handlePhoneChange = (text: string): void => {
        setPhoneNumber(cleanPhoneNumber(text));
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        if (!validatePhoneNumber(phoneNumber)) {
            Alert.alert('Error', 'Phone number must be exactly 7 digits');
            return;
        }

        setIsSaving(true);
        try {
            // Check if a contact with this phone number already exists
            const existingContact = await findContactByPhoneNumber(cleanPhoneNumber(phoneNumber));

            if (existingContact) {
                // Phone number already exists, ask user if they want to rename
                Alert.alert(
                    'Contact Already Exists',
                    `A contact named "${existingContact.name}" already has the number ${formatPhoneNumber(phoneNumber)}. Would you like to rename that contact to "${name.trim()}"?`,
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => setIsSaving(false)
                        },
                        {
                            text: 'Rename',
                            onPress: async () => {
                                try {
                                    // Update the existing contact with the new name
                                    const updatedContact: Contact = {
                                        ...existingContact,
                                        name: name.trim(),
                                        photo: photo || existingContact.photo
                                    };
                                    await updateContact(updatedContact);
                                    Alert.alert('Success', 'Contact renamed successfully', [
                                        {
                                            text: 'OK',
                                            onPress: () => router.back(),
                                        },
                                    ]);
                                } catch (error) {
                                    console.error('Error updating contact:', error);
                                    Alert.alert('Error', 'Failed to rename contact');
                                    setIsSaving(false);
                                }
                            }
                        }
                    ]
                );
                return;
            }

            // No duplicate, create new contact
            const newContact: Contact = {
                id: generateUUID(),
                name: name.trim(),
                phoneNumber: cleanPhoneNumber(phoneNumber),
                photo: photo,
            };

            await saveContact(newContact);
            Alert.alert('Success', 'Contact created successfully', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (error) {
            console.error('Error saving contact:', error);
            Alert.alert('Error', 'Failed to save contact');
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.photoSection}>
                    <ContactPhoto 
                        photo={photo}
                        name={name}
                        size={120}
                        showChangeButton={true}
                    />
                </View>

                <View style={styles.formContainer}>
                    <ContactFormField
                        label="Name"
                        value={name}
                        isEditing={true}
                        onChangeText={setName}
                        placeholder="Enter name"
                        autoCapitalize="words"
                    />

                    <ContactFormField
                        label="Phone"
                        value={phoneNumber}
                        isEditing={true}
                        onChangeText={handlePhoneChange}
                        placeholder="Enter phone number"
                        keyboardType="number-pad"
                        maxLength={8}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.saveButton]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        <Ionicons name="checkmark" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={handleCancel}
                        disabled={isSaving}
                    >
                        <Ionicons name="close" size={20} color="#666" />
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
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
    formContainer: {
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
    saveButton: {
        backgroundColor: '#34C759',
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
