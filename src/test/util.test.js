import { trimWordSpacing, getAllLineStart, mapLocToRange } from '../util';

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

    test('getAllLineStart continuely \n correct', () => {
        const p = 'aa\n\n\na';
        expect(getAllLineStart(p)).toEqual([0, 3, 4, 5]);
    });

    test('getAllLineStart continuely mix \n \r\n correct', () => {
        const p = 'aa\r\n\n\r\n\na';
        expect(getAllLineStart(p)).toEqual([0, 4, 5, 7, 8]);
    });
});

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

describe('mapLocToRange', () => {
    test('mapLocToRange correct multiple line', () => {
        const l = [0, 3, 7, 12];
        expect(mapLocToRange(l, 2, 5)).toEqual(makeRange(0, 2, 1, 2));
    });

    test('mapLocToRange correct single line', () => {
        const l = [0, 3, 7, 12];
        expect(mapLocToRange(l, 4, 5)).toEqual(makeRange(1, 1, 1, 2));
    });

    test('mapLocToRange correct when multiple line and end in last line ', () => {
        const l = [0, 3, 7, 12];
        expect(mapLocToRange(l, 8, 15)).toEqual(makeRange(2, 1, 3, 3));
    });

    test('mapLocToRange correct when single line and end in last line ', () => {
        const l = [0, 3, 7, 12];
        expect(mapLocToRange(l, 14, 15)).toEqual(makeRange(3, 2, 3, 3));
    });
});
