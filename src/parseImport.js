import strip from 'parse-comment-es6';
import parseImportClause from './parseImportClause';
import { trimWordSpacing, getAllLineStart, mapLocToRange } from './util';

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

function mapCommentsToImport(imp, comments = []) {
    comments.forEach((comment, index) => {
        // if (comment.type === 'LineComment') {
        //     // TODO:backforward for close comment
        // }
        /**
         * find leading comment
         */
        if (comment) {
            // if (comment.loc.end.line + 1 === imp. )
        }
        /**
         * find interweave comment
         */
    });
    return imp;
}

export default function parseImport(originText) {
    const imports = getAllImport(originText);
    const comments = strip(originText).comments;

    const pickedImports = [];
    imports.forEach((imp) => {
        const res = mapCommentsToImport(imp, comments);
        if (res != null) {
            pickedImports.push(res);
        }
    });
    return pickedImports;
}


// TODO: make line comment follow the last identifier
// TODO: extract all blockcomment (in new line or not decided by the occupied lines if the comment)
// TODO: backforward for the leading comment
// TODO: forward for ther trailing comment
// TODO: we make the comment end of the line if exist the block comment in the begining of the line,
//       follow the 'import' word

// exculde the first leading comment of the first import, if exist 'flow' 'Copyright' 'LICENSE'
