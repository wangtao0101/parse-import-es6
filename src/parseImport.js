import strip from 'parse-comment-es6';
import parseImportClause from './parseImportClause';
import { trimWordSpacing, getAllLineStart, mapLocToRange } from './util';

// TODO: make line comment follow the last identifier
// TODO: extract all blockcomment (in new line or not decided by the occupied lines if the comment)
// TODO: we make the comment end of the line if exist the block comment in the begining of the line,
//       follow the first identifier of the line include 'import' 'from'
// TODO: handle there my be sentences between import statement and linecomment begin, low p
// TODO: handle there my be sentences between one line blockcomemnt and import statement, low p

const importRegex = /(?:import[\s]+)([\s\S]*?)(?:from[\s]+['|"](\w+)['|"](?:\s*;){0,1})/g;
/**
 * return all import statements
 * @param {*string} strippedText text without comments
 */
export function getAllImport(originText) {
    let res = null;
    const importList = [];
    const lineStart = getAllLineStart(originText);
    while ((res = importRegex.exec(originText)) != null) { // eslint-disable-line
        let importedDefaultBinding = null;
        let nameSpaceImport = null;
        let namedImports = null;
        let error = 0;
        const moduleSpecifier = res[2];
        const importClause = trimWordSpacing(res[1]);

        const parseResult = parseImportClause(importClause);
        if (parseResult != null) {
            importedDefaultBinding = parseResult.importedDefaultBinding;
            nameSpaceImport = parseResult.nameSpaceImport;
            namedImports = parseResult.namedImports;
        } else {
            error = 1;
        }

        importList.push({
            importedDefaultBinding,
            nameSpaceImport,
            namedImports,
            moduleSpecifier,
            range: {
                start: res.index,
                end: res.index + res[0].length,
            },
            loc: mapLocToRange(lineStart, res.index, res.index + res[0].length),
            raw: res[0],
            error,
        });
    }
    return importList;
}

// exculde the first leading comment of the first import, if exist 'flow' 'Copyright' 'LICENSE'
const ignoreComment = /@flow|license|copyright/i;

function findLeadingComments(comments, index, first) {
    const leadComments = [];
    if (first && ignoreComment.test(comments[index].raw)) {
        return leadComments;
    }
    let backIndex = index - 1;
    while (backIndex >= 0 &&
        (comments[backIndex].loc.end.line + 1 === comments[backIndex + 1].loc.start.line
            || comments[backIndex].loc.end.line === comments[backIndex + 1].loc.start.line)) {
        if (first && ignoreComment.test(comments[backIndex].raw)) {
            break;
        }
        backIndex -= 1;
    }
    for (let ind = backIndex + 1; ind <= index; ind += 1) {
        leadComments.push(comments[ind]);
    }
    return leadComments;
}

function findTrailingComments(comments, index) {
    const trailingComments = [];
    let forwardIndex = index;
    while (forwardIndex < comments.length - 1 &&
        (comments[forwardIndex].loc.end.line + 1 === comments[forwardIndex + 1].loc.start.line
            || comments[forwardIndex].loc.end.line === comments[forwardIndex + 1].loc.start.line)) {
        forwardIndex += 1;
    }
    for (let ind = index; ind <= forwardIndex; ind += 1) {
        trailingComments.push(comments[ind]);
    }
    return trailingComments;
}

export function mapCommentsToImport(imp, comments = [], first = false) {
    let leadComments = [];
    let trailingComments = [];
    for (let index = 0; index < comments.length; index += 1) {
        // filter import in comment, TODO: filter all wapper statement like '/', '"', "`"
        const comment = comments[index];
        if (comment.range.start <= imp.range.start && comment.range.end >= imp.range.end) {
            return null;
        }
        if (comment.loc.end.line + 1 === imp.loc.start.line) {
            // look forward for the last match comment
            while (index + 1 < comments.length
                && comments[index + 1].loc.end.line + 1 === imp.loc.start.line) {
                index += 1;
            }
            leadComments = findLeadingComments(comments, index, first);
        }
        if (comment.loc.start.line === imp.loc.end.line + 1) {
            trailingComments = findTrailingComments(comments, index);
            // skip the trailingComments, there will make bug if multiple comments in same line
            if (trailingComments.length !== 0) {
                index += trailingComments.length - 1;
            }
        }
        /**
         * find interweave comment
         */
    }
    return Object.assign({}, imp, {
        leadComments,
        trailingComments,
    });
}

export default function parseImport(originText) {
    const imports = getAllImport(originText);
    const comments = strip(originText, { comment: true, range: true, loc: true, raw: true })
        .comments;

    const pickedImports = [];
    imports.forEach((imp, index) => {
        const res = mapCommentsToImport(imp, comments, index === 0);
        if (res != null) {
            pickedImports.push(res);
        }
    });
    return pickedImports;
}

