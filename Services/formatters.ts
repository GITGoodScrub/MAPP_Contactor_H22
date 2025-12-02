/**
 * Format a phone number as XXX XXXX
 */
export const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 3) {
        return cleaned;
    }
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)}`;
};

/**
 * Get initials from a name (first letter of each word)
 */
export const getInitials = (name: string): string => {
    if (!name.trim()) return '?';
    const parts = name.trim().split(' ').filter(part => part.length > 0);
    return parts.map(part => part[0]).join('').toUpperCase();
};

/**
 * Validate phone number (must be 7 digits)
 */
export const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 7;
};

/**
 * Clean phone number input (remove non-numeric, limit to 7 digits)
 */
export const cleanPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.slice(0, 7);
};
