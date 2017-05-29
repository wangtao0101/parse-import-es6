import { trimWordSpacing, matchDefaultImport } from './util';

export default function parseImport(originText) {
    return importRegex.exec(originText);
}

const importRegex = /(?:import[\s]+)([\s\S]*?)(?:from[\s]+['|"](\w+)['|"](?:\s*;){0,1})/g;
const importBracketRegex = /\{(.*)\}/;
/**
 * return all imports tol
 * @param {*string} strippedText text without comments
 */
export function getImportByRegex(originText) {
    let res = null;
    const importList = [];
    while ((res = importRegex.exec(originText)) != null) { // eslint-disable-line
        let defaultImport = null;
        const bracketImport = [];
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
                .map(s => s.trim())
                .filter(s => s !== '')
            );
            // test the defaultimport is match the es6 import rule
            defaultImport = importBody.replace(new RegExp(importBracketMatch[0]), ' ').trim();
            const l = defaultImport.length;
            if (defaultImport === '') {
                defaultImport = null;
            } else if (defaultImport[0] === ',' && matchDefaultImport(defaultImport.slice(1).trim())) {
                defaultImport = defaultImport.slice(1).trim();
            } else if (defaultImport[l - 1] === ',' && matchDefaultImport(defaultImport.slice(0, l - 1).trim())) {
                defaultImport = defaultImport.slice(0, l - 1).trim();
            } else {
                error = 1;
            }
        }
        if (error === 0) {
            importList.push({
                defaultImport,
                bracketImport,
                importPath,
                start: res.index,
                // TODO:  change start end to range style
                end: res.index + res[0].length,
                raw: res[0],
                error,
            });
        } else {
            importList.push({
                importPath,
                start: res.index,
                end: res.index + res[0].length,
                raw: res[0],
                error,
            });
        }
    }
    return importList;
}
