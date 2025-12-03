import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getInitials } from '../../Services';

interface ContactPhotoProps {
    photo: string | null;
    name: string;
    size?: number;
    showChangeButton?: boolean;
    onChangePress?: () => void;
}

export const ContactPhoto: React.FC<ContactPhotoProps> = ({ 
    photo, 
    name, 
    size = 120,
    showChangeButton = false,
    onChangePress 
}) => {
    const radius = size / 2;
    const fontSize = size / 2.5;

    return (
        <View style={styles.container}>
            {photo ? (
                <Image
                    source={{ uri: photo }}
                    style={[styles.photo, { width: size, height: size, borderRadius: radius }]}
                />
            ) : (
                <View style={[styles.photoPlaceholder, { width: size, height: size, borderRadius: radius }]}>
                    <Text style={[styles.photoInitials, { fontSize }]}>
                        {getInitials(name)}
                    </Text>
                </View>
            )}
            {showChangeButton && (
                <TouchableOpacity style={styles.changePhotoButton} onPress={onChangePress}>
                    <Text style={styles.changePhotoText}>
                        {photo ? 'Change Photo' : 'Add Photo'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    photo: {
        backgroundColor: '#ccc',
    },
    photoPlaceholder: {
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoInitials: {
        color: '#fff',
        fontWeight: '600',
    },
    changePhotoButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#007AFF',
        borderRadius: 20,
    },
    changePhotoText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});
