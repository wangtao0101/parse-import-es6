import { getImportByRegex } from '../parseImport';

describe('test getImportByRegex', () => {
    test('get default correctly', () => {
        const p = "import a from 'aa'";
        expect(getImportByRegex(p)).toEqual([{
            defaultImport: 'a',
            bracketImport: [],
            importPath: 'aa',
            start: 0,
            end: 18,
            raw: "import a from 'aa'",
            error: 0,
        }]);
    });

    test('get named import correctly', () => {
        const p = "import { a } from 'aa'";
        expect(getImportByRegex(p)).toEqual([{
            defaultImport: null,
            bracketImport: ['a'],
            importPath: 'aa',
            start: 0,
            end: 22,
            raw: "import { a } from 'aa'",
            error: 0,
        }]);
    });

    test('get named import and default import correctly', () => {
        const p = "import b, { a } from 'aa'";
        expect(getImportByRegex(p)).toEqual([{
            defaultImport: 'b',
            bracketImport: ['a'],
            importPath: 'aa',
            start: 0,
            end: 25,
            raw: "import b, { a } from 'aa'",
            error: 0,
        }]);
    });

    test('get import correctly if named import is empty', () => {
        const p = "import b, { \r\n} from 'aa'";
        expect(getImportByRegex(p)).toEqual([{
            defaultImport: 'b',
            bracketImport: [],
            importPath: 'aa',
            start: 0,
            end: 25,
            raw: "import b, { \r\n} from 'aa'",
            error: 0,
        }]);
    });

    test('get import correctly if exist line feed', () => {
        const p = "import b\r, { \r\na \r\n, c} \n from 'aa';";
        expect(getImportByRegex(p)).toEqual([{
            defaultImport: 'b',
            bracketImport: ['a', 'c'],
            importPath: 'aa',
            start: 0,
            end: 36,
            raw: "import b\r, { \r\na \r\n, c} \n from 'aa';",
            error: 0,
        }]);
    });

    test('get import correctly if default import after named import', () => {
        const p = "import { \r\na \r\n, c}, b from 'aa';";
        expect(getImportByRegex(p)).toEqual([{
            defaultImport: 'b',
            bracketImport: ['a', 'c'],
            importPath: 'aa',
            start: 0,
            end: 33,
            raw: "import { \r\na \r\n, c}, b from 'aa';",
            error: 0,
        }]);
    });

    test('get import correctly if exist as', () => {
        const p = "import a as b, { c as d, f } from 'aa';";
        expect(getImportByRegex(p)).toEqual([{
            defaultImport: 'a as b',
            bracketImport: ['c as d', 'f'],
            importPath: 'aa',
            start: 0,
            end: 39,
            raw: "import a as b, { c as d, f } from 'aa';",
            error: 0,
        }]);
    });

    test('get error import if default import is error', () => {
        const p = "import a b, { c as d, f } from 'aa';";
        expect(getImportByRegex(p)).toEqual([{
            importPath: 'aa',
            start: 0,
            end: 36,
            raw: "import a b, { c as d, f } from 'aa';",
            error: 1,
        }]);
    });
});
