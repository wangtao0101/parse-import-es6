export function trimWordSpacing(text = '') {
    return text.trim().replace(/[\s]/g, ' ').replace(/\s+/g, ' ');
}

const defaultImportRegex = /(^\w*$)|(^\*\s+as\s+\w+$)|(^\w+\s+as\s+\w+$)/;
export function matchDefaultImport(text) {
    return defaultImportRegex.test(text);
}
