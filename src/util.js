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
        } else {
            position += 1;
        }
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

/**
 * replace all comment in text and do no change feedline and range of import statement's location
 * @param {*string} originText
 * @param {*comments} comments
 */
export function replaceComment(originText, comments) {
    let text = originText;
    comments.forEach((comment) => {
        const startText = text.slice(0, comment.range.start);
        const endText = text.slice(comment.range.end);
        if (comment.type === 'LineComment') {
            const middle = ' '.repeat(comment.range.end - comment.range.start);
            text = startText.concat(middle, endText);
        } else {
            const middle = ' '
                .repeat(
                    comment.range.end - comment.range.start - (comment.loc.end.line - comment.loc.start.line)
                )
                .concat('\n'.repeat(comment.loc.end.line - comment.loc.start.line));
            text = startText.concat(middle, endText);
        }
    });
    return text;
}
