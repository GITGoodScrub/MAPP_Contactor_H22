import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen 
                name="index" 
                options={{ 
                    title: 'Contacts',
                    headerLargeTitle: true,
                }} 
            />
            <Stack.Screen 
                name="add-contact" 
                options={{ 
                    title: 'New Contact',
                    presentation: 'modal',
                }} 
            />
            <Stack.Screen 
                name="contact-detail" 
                options={{ 
                    title: 'Contact Details',
                }} 
            />
        </Stack>
    );
}
