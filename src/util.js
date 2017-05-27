
export function trimWordSpacing(text = '') { // eslint-disable-line
    return text.trim().replace(/[\s]/g, ' ').replace(/\s+/g, ' ');
}
