import parseImportClause from '../parseImportClause';

function makeRetrun(importedDefaultBinding, nameSpaceImport, namedImports) {
    return {
        importedDefaultBinding,
        nameSpaceImport,
        namedImports,
    };
}

describe('parseImportClause', () => {
    test('ImportedDefaultBinding', () => {
        expect(parseImportClause('a$')).toEqual(makeRetrun('a$', null, []));
    });

    test('NameSpaceImport', () => {
        expect(parseImportClause('* as b$')).toEqual(makeRetrun(null, '* as b$', []));
    });

    test('NamedImports', () => {
        expect(parseImportClause('{a$, $b, c}')).toEqual(makeRetrun(null, null, ['a$', '$b', 'c']));
    });

    test('ImportedDefaultBinding, NameSpaceImport', () => {
        expect(parseImportClause('a, * as b')).toEqual(makeRetrun('a', '* as b', []));
    });

    test('ImportedDefaultBinding, NamedImports', () => {
        expect(parseImportClause('a, {a, b, c}')).toEqual(makeRetrun('a', null, ['a', 'b', 'c']));
    });

    test('should return null', () => {
        expect(parseImportClause('a, a * c, {a, b, c}')).toEqual(null);
        expect(parseImportClause('a a')).toEqual(null);
        expect(parseImportClause('{ a, b, c')).toEqual(null);
        expect(parseImportClause('a, b, c }')).toEqual(null);
        expect(parseImportClause('* as c c')).toEqual(null);
        expect(parseImportClause('a, b, c }')).toEqual(null);
    });
});
