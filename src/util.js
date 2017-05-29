export function trimWordSpacing(text = '') {
    return text.trim().replace(/[\s]/g, ' ').replace(/\s+/g, ' ');
}

/**
 * get all line start position in text
 * @param {*string} text
 */
export function getAllLineStart(text = '') {
    const lineStart = [0];
    let position = 0;
    while (position < text.length - 1) {
        if (text[position] === '\r' || text[position] === '\n') {
            if (text[position] === '\r' && text[position + 1] === '\n') {
                position += 2;
                if (position < text.length) {
                    lineStart.push(position);
                }
            } else {
                position += 1;
                lineStart.push(position);
            }
        }
        position += 1;
    }
    return lineStart;
}
