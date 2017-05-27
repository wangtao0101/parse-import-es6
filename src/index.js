import parseImport, { getImportByRegex } from './parseImport';

export default parseImport;

const p = "import * as c, { a, c } from 'b'";

// console.log(parseImport(p));

getImportByRegex(p);
