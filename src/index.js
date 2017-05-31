import parseImport from './parseImport';

export default parseImport;

const p = `
            // i am a comment, one
            import a, { b, c as d } from 'aa';
            // i am a comment, two`;
console.log(parseImport(p));
