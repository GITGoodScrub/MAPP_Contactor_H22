import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface ContactFormFieldProps {
    label: string;
    value: string;
    isEditing: boolean;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'number-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    maxLength?: number;
}

export const ContactFormField: React.FC<ContactFormFieldProps> = ({
    label,
    value,
    isEditing,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    autoCapitalize = 'none',
    maxLength,
}) => {
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.label}>{label}</Text>
            {isEditing ? (
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    maxLength={maxLength}
                />
            ) : (
                <Text style={styles.value}>{value || `No ${label.toLowerCase()}`}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    fieldContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    value: {
        fontSize: 18,
        color: '#333',
    },
    input: {
        fontSize: 18,
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#007AFF',
        paddingVertical: 8,
    },
});
