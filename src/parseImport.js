import parseImportClause from './parseImportClause';
import { trimWordSpacing } from './util';

export default function parseImport(originText) {
    return importRegex.exec(originText);
}

const importRegex = /(?:import[\s]+)([\s\S]*?)(?:from[\s]+['|"](\w+)['|"](?:\s*;){0,1})/g;
/**
 * return all import statements
 * @param {*string} strippedText text without comments
 */
export function getAllImport(originText) {
    let res = null;
    const importList = [];
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
            start: res.index,
            // TODO:  change start end to range style
            end: res.index + res[0].length,
            raw: res[0],
            error,
        });
    }
    return importList;
}
