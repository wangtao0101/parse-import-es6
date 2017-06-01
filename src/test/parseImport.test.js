import parseImport, { getAllImport } from '../parseImport';

function makeLoc(lineS, columnS, lineE, columnE) {
    return {
        start: {
            line: lineS,
            column: columnS,
        },
        end: {
            line: lineE,
            column: columnE,
        },
    };
}

describe('test getAllImport', () => {
    test('get importedDefaultBinding correctly', () => {
        const p = "import a from 'aa'";
        expect(getAllImport(p)).toEqual([{
            importedDefaultBinding: 'a',
            nameSpaceImport: null,
            namedImports: [],
            moduleSpecifier: 'aa',
            range: {
                start: 0,
                end: 18,
            },
            loc: makeLoc(0, 0, 0, 18),
            raw: "import a from 'aa'",
            error: 0,
        }]);
    });

    test('get namedImports correctly', () => {
        const p = "import { a } from 'aa'";
        expect(getAllImport(p)).toEqual([{
            importedDefaultBinding: null,
            nameSpaceImport: null,
            namedImports: ['a'],
            moduleSpecifier: 'aa',
            range: {
                start: 0,
                end: 22,
            },
            loc: makeLoc(0, 0, 0, 22),
            raw: "import { a } from 'aa'",
            error: 0,
        }]);
    });

    test('get namedImports and importedDefaultBinding correctly', () => {
        const p = "import b, { a } from 'aa'";
        expect(getAllImport(p)).toEqual([{
            importedDefaultBinding: 'b',
            nameSpaceImport: null,
            namedImports: ['a'],
            moduleSpecifier: 'aa',
            range: {
                start: 0,
                end: 25,
            },
            loc: makeLoc(0, 0, 0, 25),
            raw: "import b, { a } from 'aa'",
            error: 0,
        }]);
    });

    test('get import correctly if named import is empty', () => {
        const p = "import b, { \r\n} from 'aa'";
        expect(getAllImport(p)).toEqual([{
            importedDefaultBinding: 'b',
            nameSpaceImport: null,
            namedImports: [],
            moduleSpecifier: 'aa',
            range: {
                start: 0,
                end: 25,
            },
            loc: makeLoc(0, 0, 1, 11),
            raw: "import b, { \r\n} from 'aa'",
            error: 0,
        }]);
    });

    test('get import correctly if named import endwith ,', () => {
        const p = "import b, { a, c, } from 'aa'";
        expect(getAllImport(p)).toEqual([{
            importedDefaultBinding: 'b',
            nameSpaceImport: null,
            namedImports: ['a', 'c'],
            moduleSpecifier: 'aa',
            range: {
                start: 0,
                end: 29,
            },
            loc: makeLoc(0, 0, 0, 29),
            raw: "import b, { a, c, } from 'aa'",
            error: 0,
        }]);
    });

    test('get import correctly if exist line feed', () => {
        const p = "import b\r, { \r\na \r\n, c} \n from 'aa';";
        expect(getAllImport(p)).toEqual([{
            importedDefaultBinding: 'b',
            nameSpaceImport: null,
            namedImports: ['a', 'c'],
            moduleSpecifier: 'aa',
            range: {
                start: 0,
                end: 36,
            },
            loc: makeLoc(0, 0, 4, 11),
            raw: "import b\r, { \r\na \r\n, c} \n from 'aa';",
            error: 0,
        }]);
    });

    test('get nameSpaceImport correctly', () => {
        const p = "import * as a from 'aa';";
        expect(getAllImport(p)).toEqual([{
            importedDefaultBinding: null,
            nameSpaceImport: '* as a',
            namedImports: [],
            moduleSpecifier: 'aa',
            range: {
                start: 0,
                end: 24,
            },
            loc: makeLoc(0, 0, 0, 24),
            raw: "import * as a from 'aa';",
            error: 0,
        }]);
    });

    test('should get error', () => {
        const p = "import a b, { c as d, f } from 'aa';";
        expect(getAllImport(p)).toEqual([{
            importedDefaultBinding: null,
            nameSpaceImport: null,
            namedImports: null,
            moduleSpecifier: 'aa',
            range: {
                start: 0,
                end: 36,
            },
            loc: makeLoc(0, 0, 0, 36),
            raw: "import a b, { c as d, f } from 'aa';",
            error: 1,
        }]);
    });

    test('get multiple import correct', () => {
        const p = "import a, { c as d, f } from 'aa';\r\nimport e, { g } from 'g'";
        expect(getAllImport(p)).toEqual([{
            importedDefaultBinding: 'a',
            nameSpaceImport: null,
            namedImports: ['c as d', 'f'],
            moduleSpecifier: 'aa',
            range: {
                start: 0,
                end: 34,
            },
            loc: makeLoc(0, 0, 0, 34),
            raw: "import a, { c as d, f } from 'aa';",
            error: 0,
        }, {
            importedDefaultBinding: 'e',
            nameSpaceImport: null,
            namedImports: ['g'],
            moduleSpecifier: 'g',
            range: {
                start: 36,
                end: 60,
            },
            loc: makeLoc(1, 0, 1, 24),
            raw: "import e, { g } from 'g'",
            error: 0,
        }]);
    });
});


describe('parseImport', () => {
    test('parseImport correctly', () => {
        const p = `
            // i am a comment, one
            import { a } from 'aa';
            // i am a comment, two
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('close comment will be treated as leading or trailing comment', () => {
        const p = `
            // i am a comment, one
            /**
             * i am a comment, two
             */
            import { a } from 'aa'
            // i am a comment, three
            // i am a comment, four
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('filter flow', () => {
        const p = `
            //@flow
            // i am a comment, one
            import { a } from 'aa'
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('filter copyright', () => {
        const p = `
            /**
             * Copyright 2017-present, wangtao0101.
             * All rights reserved.
             */
            // i am a comment, one
            import { a } from 'aa'
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('filter commentted import', () => {
        const p = `
            // i am a comment, one
            import { a } from 'aa'

            //import { b } from 'bb'
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse multiple import correctly', () => {
        const p = `
            // i am a comment, one
            import { a } from 'aa'

            // i am a comment, two
            import { b } from 'bb'
            // i am a comment, three
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parseImport complex import correctly', () => {
        const p = `
            // i am a comment, one
            import a, { b, c as d } from 'aa';
            // i am a comment, two
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parseImport parse last comment in end line correctly', () => {
        const p = `
            // i am a comment, one
            import a, { b, c as d } from 'aa';
            // i am a comment, two`;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse leading comment in the same line correctly', () => {
        const p = `
            /*
            i am a comment, one */ //i am a comment, two
            import a, { b, c as d } from 'aa';
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse multiple leading comments in the same line correctly', () => {
        const p = `
            //i am a comment, three

            //i am a comment, four
            /*
            i am a comment, one */ /*a*/ /*b*/ //i am a comment, two
            import a, { b, c as d } from 'aa';
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse multiple trailing comments in the same line correctly', () => {
        const p = `
            import a, { b, c as d } from 'aa';
            /*a*/ /*b*/ /*
            c*/ //i am a comment, one
            //i am a comment, two

            //i am a comment, three
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('close comment is treated as leading comment correctly', () => {
        const p = `
            // i am a comment, one
            import { a } from 'aa'
            // i am a comment, two
            import { b } from 'bb'
            // i am a comment, three
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });
});
