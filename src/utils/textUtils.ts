export function removeAccents(input: string): string{
    return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function sanitizeString(input: string): string{
    return removeAccents(input).replace(/[^a-zA-Z0-9]/g, "");
}