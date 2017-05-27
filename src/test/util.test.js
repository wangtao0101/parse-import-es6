import { trimWordSpacing, matchDefaultImport } from '../util';

describe('trimWordSpacing correct', () => {
    test('trimWordSpacing multiple blank', () => {
        expect(trimWordSpacing('a  b')).toEqual('a b');
    });

    test('trimWordSpacing multiple blank and \\r \\n', () => {
        expect(trimWordSpacing('a  b\rc \r\nd \r')).toEqual('a b c d');
    });
});

describe('matchDefaultImport correct', () => {
    test('match * as b', () => {
        expect(matchDefaultImport('* as b')).toBeTruthy();
    });

    test('match single word', () => {
        expect(matchDefaultImport('ccc')).toBeTruthy();
    });

    test('match aaa as ccc', () => {
        expect(matchDefaultImport('aaa as ccc')).toBeTruthy();
    });

    test('unmatch * as b b', () => {
        expect(matchDefaultImport('* as b b')).toBeFalsy();
    });

    test('unmatch b, b', () => {
        expect(matchDefaultImport('b, b')).toBeFalsy();
    });

    test('unmatch , b as c', () => {
        expect(matchDefaultImport(', b as c')).toBeFalsy();
    });
});
