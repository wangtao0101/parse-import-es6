import parseImport from './parseImport';

export default parseImport;

const p = `
            /*
            i am a comment, one */ //i am a comment, two
            import a, { b, c as d } from 'aa';
        `;
console.log(parseImport(p));
