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

/**
 * return leading comment list
 * @param {*list<comment>} comments
 * @param {*} the last match leading comment of one import
 * @param {*} beginIndex the potential begin of the comment index of the import
 * @param {*} first whether first import
 */
function findLeadingComments(comments, index, beginIndex, first) {
    const leadComments = [];
    if (first && ignoreComment.test(comments[index].raw)) {
        return leadComments;
    }
    let backIndex = index - 1;
    while (backIndex >= beginIndex &&
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

function findTrailingComments(comments, index, nextImp) {
    const trailingComments = [];
    let forwardIndex = index;
    while (forwardIndex < comments.length - 1 &&
        (comments[forwardIndex].loc.end.line + 1 === comments[forwardIndex + 1].loc.start.line
            || comments[forwardIndex].loc.end.line === comments[forwardIndex + 1].loc.start.line)) {
        forwardIndex += 1;
    }
    for (let ind = index; ind <= forwardIndex; ind += 1) {
        trailingComments.push(comments[ind]);
        /**
         * check if the comment is next to the nextImp,
         * if true, put these comments into leading comments of next imp
         */
        if (nextImp && comments[ind].loc.end.line + 1 >= nextImp.loc.start.line) {
            return [];
        }
    }
    return trailingComments;
}

export function mapCommentsToImport(imp, beginIndex, comments = [], first = false, nextImp) {
    let leadComments = [];
    let trailingComments = [];
    let index;
    for (index = beginIndex; index < comments.length; index += 1) {
        const comment = comments[index];
        if (comment.loc.end.line + 1 === imp.loc.start.line
            // treat blockcomment before import(in same line) as leading comment
            // e.g /*asdfasdf
            //     asdf*/ import ...
            || (comment.loc.end.line === imp.loc.start.line && comment.loc.start.line < imp.loc.start.line)) {
            // look forward for the last match comment
            while (index + 1 < comments.length
                && comments[index + 1].loc.end.line + 1 === imp.loc.start.line) {
                index += 1;
            }
            leadComments = findLeadingComments(comments, index, beginIndex, first);
        }
        if (comment.loc.start.line === imp.loc.end.line + 1
            // treat blockcomment after import(in same line) as trailing comment
            // e.g import ... /*asdfasdf
            //     asdf*/
            || (comment.loc.start.line === imp.loc.end.line && comment.loc.end.line > imp.loc.end.line)) {
            trailingComments = findTrailingComments(comments, index, nextImp);
            // skip the trailingComments, there will make bug if multiple comments in same line
            if (trailingComments.length !== 0) {
                index += trailingComments.length - 1;
            }
        }
        /**
         * find interweave comment
         */
        if (comment.loc.start.line >= imp.loc.end.line + 1) {
            break;
        }
    }
    return [
        Object.assign({}, imp, {
            leadComments,
            trailingComments,
        }),
        index,
    ];
}

export default function parseImport(originText) {
    const imports = getAllImport(originText);
    const comments = strip(originText, { comment: true, range: true, loc: true, raw: true })
        .comments;

    const filterCommentImports = imports.filter((imp) => {
        // filter import in comment, TODO: filter all wapper statement like '/', '"', "`"
        for (let index = 0; index < comments.length; index += 1) {
            const comment = comments[index];
            if (comment.range.start <= imp.range.start && comment.range.end >= imp.range.end) {
                return false;
            }
        }
        return true;
    });

    const pickedImports = [];
    let commentIndex = 0;
    filterCommentImports.forEach((imp, index) => {
        const [res, rIndex] = mapCommentsToImport(
            imp, commentIndex, comments, index === 0, filterCommentImports[index + 1]);
        if (res != null) {
            commentIndex = rIndex;
            pickedImports.push(res);
        }
    });
    return pickedImports;
}

