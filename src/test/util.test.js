import { trimWordSpacing } from '../util';

describe('trimWordSpacing correct', () => {
    test('trimWordSpacing multiple blank', () => {
        expect(trimWordSpacing('a  b')).toEqual('a b');
    });

    test('trimWordSpacing multiple blank and \\r \\n', () => {
        expect(trimWordSpacing('a  b\rc \r\nd \r')).toEqual('a b c d');
    });
});
