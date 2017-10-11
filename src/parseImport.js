import strip from 'parse-comment-es6';
import parseImportClause from './parseImportClause';
import { trimWordSpacing, getAllLineStart, mapLocToRange, replaceComment } from './util';

// TODO: make line comment follow the last identifier
// TODO: extract all blockcomment (in new line or not decided by the occupied lines if the comment)
// TODO: we make the comment end of the line if exist the block comment in the begining of the line,
//       follow the first identifier of the line include 'import' 'from'
// TODO: handle there my be sentences between import statement and linecomment begin, low p
// TODO: handle there my be sentences between one line blockcomemnt and import statement, low p

/**
 * (?:import[\s]+) match 'import '
 * ?![\s]import[\s match not contain \simport\s
 * (?:(?![\s]import[\s])[\s\S]) match any char include \n but forward string not contain \simport\s
 */

// eslint-disable-next-line
const importRegex = /(?:import[\s]+)(?:((?:(?![\s]import[\s])[\s\S])*?)from[\s]+)??['|"]([A-Za-z0-9_\-./]*)['|"](?:\s*;)?/g;
/**
 * return all import statements
 * @param {*string} strippedText text without comments
 */
export function getAllImport(replaceText, originText) {
    if (originText == null) {
        originText = replaceText; // eslint-disable-line
    }
    let res = null;
    const importList = [];
    // here we must use not replaced text to calculate linestart
    const lineStart = getAllLineStart(originText);
    while ((res = importRegex.exec(replaceText)) != null) { // eslint-disable-line
        let importedDefaultBinding = null;
        let nameSpaceImport = null;
        let namedImports = [];
        let error = 0;
        const moduleSpecifier = res[2];

        if (res[1] != null) {
            const importClause = trimWordSpacing(res[1]);
            const parseResult = parseImportClause(importClause);
            if (parseResult != null) {
                importedDefaultBinding = parseResult.importedDefaultBinding;
                nameSpaceImport = parseResult.nameSpaceImport;
                namedImports = parseResult.namedImports;
            } else {
                error = 1;
            }
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
            raw: originText.substring(res.index, res.index + res[0].length),
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

function getIdentifierLoc(identifier, regexp, imp, replaceImpRaw, lineStart, type) {
    const escapeString = regexp.replace(/\$/g, '\\$');
    const match = new RegExp(escapeString).exec(replaceImpRaw);
    const length = match[0].length - match[1].length;
    const start = match.index + length + imp.range.start;
    const end = start + match[2].length;
    return {
        identifier,
        loc: mapLocToRange(lineStart, start, end),
        range: {
            start,
            end,
        },
        type,
    };
}

function getAllIdentifierLoc(imp, originText, replaceImpRaw) {
    const identifierList = [];
    const lineStart = getAllLineStart(originText);
    identifierList.push(
        getIdentifierLoc('import',
            '^((import)[\\s,]+)',
            imp, replaceImpRaw, lineStart, 'Import')
    );
    if (imp.importedDefaultBinding != null) {
        identifierList.push(
            getIdentifierLoc(imp.importedDefaultBinding,
                `[\\s]+((${imp.importedDefaultBinding})[\\s,]+)`,
                imp, replaceImpRaw, lineStart, 'ImportedDefaultBinding')
        );
    }
    if (imp.nameSpaceImport != null) {
        const alias = imp.nameSpaceImport.split(' as ')[1];
        identifierList.push(
            getIdentifierLoc(imp.nameSpaceImport,
                `[\\s,]+((\\*\\s+as\\s+${alias})[\\s,]+)`,
                imp, replaceImpRaw, lineStart, 'NameSpaceImport')
        );
    }
    imp.namedImports.forEach((id) => {
        const alias = id.split(' as ');
        if (alias[1] == null) {
            identifierList.push(
                getIdentifierLoc(id,
                    `[\\s,{]+((${id})[\\s,}]+)`,
                    imp, replaceImpRaw, lineStart, 'NamedImports')
            );
        } else {
            identifierList.push(
                getIdentifierLoc(id,
                    `[\\s,{}]+((${alias[0]}\\s+as\\s+${alias[1]})[\\s,}]+)`,
                    imp, replaceImpRaw, lineStart, 'NamedImports')
            );
        }
    });
    if (imp.importedDefaultBinding != null || imp.nameSpaceImport != null || imp.namedImports.length !== 0) {
        identifierList.push(
            getIdentifierLoc('from',
                '[\\s]+((from)[\\s,]+)',
                imp, replaceImpRaw, lineStart, 'From')
        );
    }
    identifierList.push(
        getIdentifierLoc(imp.moduleSpecifier,
            `[\\s]+[\\'\\"]((${imp.moduleSpecifier})[\\'\\"])`,
            imp, replaceImpRaw, lineStart, 'ModuleSpecifier')
    );
    return identifierList;
}

function mapCommentsToIdentifier(comments, imp, originText, replaceImpRaw) {
    const identifierList = getAllIdentifierLoc(imp, originText, replaceImpRaw);
    return comments.map((comment) => { // eslint-disable-line
        for (let index = 0; index < identifierList.length; index += 1) {
            const identifier = identifierList[index];
            if (identifier.loc.end.line === comment.loc.start.line) {
                /**
                 * comment before identifier e.g.
                 * /*i am a comment *\/ import a from 'aa';
                 * Then, this comment belong to import identifier
                 */
                if (comment.range.end < identifier.range.start) {
                    return Object.assign(comment, {
                        identifier,
                    });
                }
                /**
                 * if there has same identifier in the same line,
                 * if the comment is between the two ,then the comment belongs to first comment
                 * e.g.
                 * import a from 'aa'; /*asf*\/ import b from 'bb'; the comment belongs to first comment
                 */
                if (index + 1 < identifierList.length &&
                    identifierList[index + 1].loc.end.line === comment.loc.start.line &&
                    identifierList[index + 1].range.start < comment.range.start) {
                    continue; // eslint-disable-line
                    // next loop it maybe go to else branch
                } else {
                    return Object.assign(comment, {
                        identifier: identifierList[index],
                    });
                }
            }
            /**
             * comment can't find identifier in the same line
             * e.g.
             * import
             * //i am a comment
             * a from 'aa'
             */
            if (identifier.loc.start.line > comment.loc.end.line) {
                return Object.assign(comment, {
                    identifier: identifierList[index],
                });
            }
        }
    });
}

function mapCommentsToImport(imp, beginIndex, comments = [], first = false, nextImp, originText, replaceImpRaw) {
    let leadComments = [];
    let trailingComments = [];
    let middleComments = [];
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
         * find middle comment
         */
        if (comment.loc.start.line >= imp.loc.start.line && comment.loc.end.line <= imp.loc.end.line) {
            middleComments.push(comment);
        }

        // (comment.loc.start.line == imp.loc.end.line + 1) must have been processed before
        if (comment.loc.start.line >= imp.loc.end.line + 1) {
            break;
        }
    }

    if (imp.error === 0) {
        middleComments = mapCommentsToIdentifier(middleComments, imp, originText, replaceImpRaw);
    }
    return [
        Object.assign({}, imp, {
            leadComments,
            trailingComments,
            middleComments,
        }),
        index,
    ];
}

export default function parseImport(originText) {
    const comments = strip(originText, { comment: true, range: true, loc: true, raw: true })
        .comments;
    const replaceText = replaceComment(originText, comments);
    const imports = getAllImport(replaceText, originText);

    // TODO: filter all wapper statement like '/', '"', "`", commented import statement has been removed

    const pickedImports = [];
    let commentIndex = 0;
    imports.forEach((imp, index) => {
        const [res, rIndex] = mapCommentsToImport(
            imp,
            commentIndex,
            comments, index === 0,
            imports[index + 1],
            originText,
            replaceText.substring(imp.range.start, imp.range.end)
        );
        if (res != null) {
            commentIndex = rIndex;
            pickedImports.push(res);
        }
    });
    return pickedImports;
}

