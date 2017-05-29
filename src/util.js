/**
 * trim all invisiable char between words expect the last blank
 * @param {*sting} text
 */
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

function findPosition(line, lineStart, position) {
    let index = line;
    while (index < lineStart.length - 1) {
        if (lineStart[index + 1] > position) {
            return {
                line: index,
                column: position - lineStart[index],
            };
        }
        index += 1;
    }
    return {
        line: index,
        column: position - lineStart[index],
    };
}

/**
 * map location style to range style in text
 * @param {*list} lineStart
 * @param {*number} startPosition
 * @param {*number} endPosition
 */
export function mapLocToRange(lineStart, startPosition, endPosition) {
    const start = findPosition(0, lineStart, startPosition);
    const end = findPosition(start.line, lineStart, endPosition);
    return {
        start,
        end,
    };
}
