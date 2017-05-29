import { trimWordSpacing, getAllLineStart } from '../util';

describe('trimWordSpacing correct', () => {
    test('trimWordSpacing multiple blank', () => {
        expect(trimWordSpacing('a  b')).toEqual('a b');
    });

    test('trimWordSpacing multiple blank and \\r \\n', () => {
        expect(trimWordSpacing('a  b\rc \r\nd \r')).toEqual('a b c d');
    });
});

describe('getAllLineStart', () => {
    test('getAllLineStart correct mac', () => {
        const p = 'aa\rbbb\rccc\r';
        expect(getAllLineStart(p)).toEqual([0, 3, 7]);
    });

    test('getAllLineStart correct linux', () => {
        const p = 'aa\nbbb\nccc\n';
        expect(getAllLineStart(p)).toEqual([0, 3, 7]);
    });

    test('getAllLineStart correct win', () => {
        const p = 'aa\r\nbbb\r\nc';
        expect(getAllLineStart(p)).toEqual([0, 4, 9]);
    });

    test('getAllLineStart correct mix', () => {
        const p = 'aa\rbbb\nccc\r\nd';
        expect(getAllLineStart(p)).toEqual([0, 3, 7, 12]);
    });
});
