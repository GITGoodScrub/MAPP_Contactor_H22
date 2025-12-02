import { Ionicons } from '@expo/vector-icons';
import * as ExpoImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cleanPhoneNumber, Contact, generateUUID, saveContact, validatePhoneNumber } from '../Services';
import { ContactFormField, ContactPhoto } from '../components/Contact';

export default function AddContactScreen() {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handlePhoneChange = (text: string): void => {
        setPhoneNumber(cleanPhoneNumber(text));
    };

 
    const handleChangePhoto = async () => {
        const {status} = await ExpoImagePicker.requestMediaLibraryPermissionsAsync()

        if (status !== 'granted') {
            Alert.alert('Permission required', 'We need access to your photos.');
            return;
        }
        
        const result = await ExpoImagePicker.launchImageLibraryAsync({
            mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
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
                        onChangePress={handleChangePhoto}
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
