import { trimWordSpacing } from './util';

export default function parseImport(originText) {
    return importRegex.exec(originText)
}

const importRegex = /(?:import[\s]+)([\s\S]*)(?:from[\s]+['|"](\w+)['|"](?:\s*;){0,1})/g;
const importBracketRegex = /\{(.*)\}/;
/**
 * return all imports
 * @param {*string} strippedText text without comments
 */
export function getImportByRegex(originText, comments) {
    let res = null;
    const importList = [];
    while ((res = Interpreter.importRegex.exec(text)) != null) {
        let defaultImport = null;
        let bracketImport = [];
        let error = 0;
        const importPath = res[2];
        const importBody = trimWordSpacing(res[1]);

        const importBracketMatch = importBracketRegex.exec(importBody);
        if (importBracketMatch == null) {
            // three possible : aa, aa as bb, * as bb
            defaultImport = importBody;
        } else {
            bracketImport.push(...importBracketMatch[1]
                .split(',')
                .filter(s => s !== '')
            );
            if (importBracketMatch.index === 0) {
                defaultImport = importBody.slice(importBracketMatch[0].length, importBody.length).replace(/\s/g, '').split(',')[1];
            } else if (importBracketMatch.index + importBracketMatch[0].length === importBody.length) {
                defaultImport = importBody.slice(0, importBracketMatch.index).replace(/\s/g, '').split(',')[0];
            } else {
                // give up import statement mistake
                error = 1;
            }
        }
    }
}
