import strip from 'parse-comment-es6';
import parseImport, { getAllImport } from '../parseImport';
import { replaceComment } from '../util';

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
            namedImports: [],
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

    test('should skip incomplete import statement', () => {
        const p = `
import { storiesOf } from '
import * as a from 'aa';'
`;
        expect(getAllImport(p)).toEqual([{
            importedDefaultBinding: null,
            nameSpaceImport: '* as a',
            namedImports: [],
            moduleSpecifier: 'aa',
            range: {
                start: 29,
                end: 53,
            },
            loc: makeLoc(2, 0, 2, 24),
            raw: "import * as a from 'aa';",
            error: 0,
        }]);
    });

    test('should get import if the identifier words contains import(test this because of regexp).', () => {
        const p = "import aimport from 'aa';'";
        expect(getAllImport(p)).toEqual([{
            importedDefaultBinding: 'aimport',
            nameSpaceImport: null,
            namedImports: [],
            moduleSpecifier: 'aa',
            range: {
                start: 0,
                end: 25,
            },
            loc: makeLoc(0, 0, 0, 25),
            raw: "import aimport from 'aa';",
            error: 0,
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

    test('get commented import correctly', () => {
        const p = "import a /*a\na*/ from 'aa'";
        const comments = strip(p, { comment: true, range: true, loc: true, raw: true })
            .comments;
        const imports = getAllImport(replaceComment(p, comments), p);
        expect(imports).toEqual([{
            importedDefaultBinding: 'a',
            nameSpaceImport: null,
            namedImports: [],
            moduleSpecifier: 'aa',
            range: {
                start: 0,
                end: 26,
            },
            loc: makeLoc(0, 0, 1, 13),
            raw: "import a /*a\na*/ from 'aa'",
            error: 0,
        }]);
    });

    test('support - and _ in moduleSpecifier', () => {
        const p = "import enUS from 'antd/lib/locale-provider/en_US';";
        const comments = strip(p, { comment: true, range: true, loc: true, raw: true })
            .comments;
        const imports = getAllImport(replaceComment(p, comments), p);
        expect(imports).toEqual([{
            importedDefaultBinding: 'enUS',
            nameSpaceImport: null,
            namedImports: [],
            moduleSpecifier: 'antd/lib/locale-provider/en_US',
            range: {
                start: 0,
                end: 50,
            },
            loc: makeLoc(0, 0, 0, 50),
            raw: "import enUS from 'antd/lib/locale-provider/en_US';",
            error: 0,
        }]);
    });

    test("import \"module-name\";import 'module-name';import a from 'aa';", () => {
        const p = "import \"module-name\";import 'module-name';import a from 'aa';";
        const comments = strip(p, { comment: true, range: true, loc: true, raw: true })
            .comments;
        const imports = getAllImport(replaceComment(p, comments), p);
        expect(imports).toEqual([{
            importedDefaultBinding: null,
            nameSpaceImport: null,
            namedImports: [],
            moduleSpecifier: 'module-name',
            range: {
                start: 0,
                end: 21,
            },
            loc: makeLoc(0, 0, 0, 21),
            raw: 'import "module-name";',
            error: 0,
        }, {
            importedDefaultBinding: null,
            nameSpaceImport: null,
            namedImports: [],
            moduleSpecifier: 'module-name',
            range: {
                start: 21,
                end: 42,
            },
            loc: makeLoc(0, 21, 0, 42),
            raw: "import 'module-name';",
            error: 0,
        }, {
            importedDefaultBinding: 'a',
            nameSpaceImport: null,
            namedImports: [],
            moduleSpecifier: 'aa',
            range: {
                start: 42,
                end: 61,
            },
            loc: makeLoc(0, 42, 0, 61),
            raw: "import a from 'aa';",
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

    test('parse import with error correctly', () => {
        const p = `
            // i am a comment, one
            "import a b, { c as d, f } from 'aa';"
            // i am a comment, two
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse import with $ correctly', () => {
        const p = `
            // i am a comment, one
            import $, { $a } from 'jquery';
            // i am a comment, two
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse import with $$ correctly', () => {
        const p = `
            // i am a comment, one
            import { $$ } from 'foo';
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

    test('treat blockcomment before import(in same line) as leading comment', () => {
        const p = `
            //asdfasdf
            /*asdfasdf
            asdfasdf*/import { a } from 'aa';
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('treat blockcomment after import(in same line) as trailing comment', () => {
        const p = `
            import { a } from 'aa'; /*asdfasdf
            asdfasdf */
            //asdfasdfasdf
        `;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse moduleSpecifier contain . or / correctly', () => {
        const p = `import { comabc } from './component/com'`; // eslint-disable-line
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse moduleSpecifier surrounded by " correctly', () => {
        const p = `import { comabc } from "./component/com"`; // eslint-disable-line
        expect(parseImport(p)).toMatchSnapshot();
    });
});

describe('parseImport middlecomment', () => {
    test('parse single line comment import correctly', () => {
        const p = `
import {aa,cc\n\n as\n\n bb} from 'aa'; //abcde`;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse comment before import correctly', () => {
        const p = `
/*abcde*/ import {aa,cc\n\n as\n\n bb} from 'aa';`;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse comment before default import correctly', () => {
        const p = `
import
/*asdfasd*/ aa, { cc as bb } from 'aa';`;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse comment in every line end  correctly', () => {
        const p = `
import {
    aa, //aaaaa
    cc as bb, //bbbbb
} from 'aa'; //ccccc`;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse comment default import correctly', () => {
        const p = `
import dd, //dddddd
{
    aa, //aaaaa
    cc as bb, //bbbbb
} from 'aa'; //ccccc`;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse nameSpaceimport import correctly', () => {
        const p = `
import dd, //dddddd
* as bb //eeeeee
from 'aa'; //ccccc`;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse comment between identifier correctly', () => {
        const p = `
import {
    aa, /*aaaaa*/ bb,
    cc as bb, //bbbbb
} from 'aa'; //ccccc`;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse all kinds of comment correctly', () => {
        const p = `
@flow

//i am a comment
import {
    aa, /*aaaaa*/ bb, //bbbbbb
    cc as bb, //ccccc
} from 'aa'; //ddddd
//eeeee
import { aa , cc as bb } from 'dd'; //fffff
`;
        expect(parseImport(p)).toMatchSnapshot();
    });

    test('parse import \'module-name\'; correctly', () => {
        const p = "import \"module-name\";import 'module-name';import a from 'aa';";
        expect(parseImport(p)).toMatchSnapshot();
    });

    test.only('parse React,{Component}from  correctly', () => {
        // eslint-disable-next-line
        const p = `import React,{Component}from 'react';`;
        expect(parseImport(p)).toMatchSnapshot();
    });
});
