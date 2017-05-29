/**
 * split ImportsList by ','
 * here wo do not check the correctness of ImportSpecifiers in ImportsList, just tolerate it
 * @param {*} text
 */
function splitImportsList(text) {
    const list = [];
    list.push(...text
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
    );
    return list;
}

const idb = '(\\w+)';
const nsi = '(\\*\\sas\\s\\w+)';
const ni = '\\{(.*)\\}';

/**
 * https://tc39.github.io/ecma262/#prod-ImportClause
 * support tc39 ImportClause exclude nexted ImportsList
 * @param {*} importClause, which has been trimed by word
 */
export default function parseImportClause(importClause) {
    const regexp = new RegExp(`(?:^${idb}\\s*,\\s*${nsi}$)|(?:^${idb}\\s*,\\s*${ni}$)|^${idb}$|^${nsi}$|^${ni}$`);
    let importedDefaultBinding = null;
    let nameSpaceImport = null;
    let namedImports = [];
    const res = importClause.match(regexp);
    if (res == null) {
        return null;
    }
    if (res[1]) {
        importedDefaultBinding = res[1];
        nameSpaceImport = res[2];
    } else if (res[3]) {
        importedDefaultBinding = res[3];
        namedImports = splitImportsList(res[4]);
    } else if (res[5]) {
        importedDefaultBinding = res[5];
    } else if (res[6]) {
        nameSpaceImport = res[6];
    } else {
        namedImports = splitImportsList(res[7]);
    }
    return {
        importedDefaultBinding,
        nameSpaceImport,
        namedImports,
    };
}
