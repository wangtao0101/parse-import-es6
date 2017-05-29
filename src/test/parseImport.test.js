import { getAllImport } from '../parseImport';

function makeRange(lineS, columnS, lineE, columnE) {
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
            start: 0,
            end: 18,
            range: makeRange(0, 0, 0, 18),
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
            start: 0,
            end: 22,
            range: makeRange(0, 0, 0, 22),
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
            start: 0,
            end: 25,
            range: makeRange(0, 0, 0, 25),
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
            start: 0,
            end: 25,
            range: makeRange(0, 0, 1, 11),
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
            start: 0,
            end: 29,
            range: makeRange(0, 0, 0, 29),
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
            start: 0,
            end: 36,
            range: makeRange(0, 0, 4, 11),
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
            start: 0,
            end: 24,
            range: makeRange(0, 0, 0, 24),
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
            start: 0,
            end: 36,
            range: makeRange(0, 0, 0, 36),
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
            start: 0,
            end: 34,
            range: makeRange(0, 0, 0, 34),
            raw: "import a, { c as d, f } from 'aa';",
            error: 0,
        }, {
            importedDefaultBinding: 'e',
            nameSpaceImport: null,
            namedImports: ['g'],
            moduleSpecifier: 'g',
            start: 36,
            end: 60,
            range: makeRange(1, 0, 1, 24),
            raw: "import e, { g } from 'g'",
            error: 0,
        }]);
    });
});
