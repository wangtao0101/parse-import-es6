import parseImport from './parseImport';

export default parseImport;

const p = "import { a } from 'b'";

console.log(parseImport(p));
