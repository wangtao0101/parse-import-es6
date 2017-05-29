import parseImport, { getImportByRegex, parseImportClause } from './parseImport';

export default parseImport;

const p = 'aa, * as b';

// console.log(parseImport(p));

console.log(parseImportClause(p));
