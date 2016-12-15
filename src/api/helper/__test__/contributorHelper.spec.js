import {
    normalizeContributor,
    contributorEquals,
    mergedContributors,
    extractContributors
} from "../contributorHelper";

[
    { input: 'Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)', expected: { name: 'Barney Rubble', email: 'b@rubble.com', url: 'http://barnyrubble.tumblr.com/' } },
    { input: ' Barney Rubble <b@rubble.com>(http://barnyrubble.tumblr.com/)', expected: { name: 'Barney Rubble', email: 'b@rubble.com', url: 'http://barnyrubble.tumblr.com/' } },
    { input: 'Barney Rubble<b@rubble.com>(http://barnyrubble.tumblr.com/)', expected: { name: 'Barney Rubble', email: 'b@rubble.com', url: 'http://barnyrubble.tumblr.com/' } },
    { input: 'Barney Rubble < b@rubble.com>', expected: { name: 'Barney Rubble', email: 'b@rubble.com', url: undefined } },
    { input: 'Barney Rubble<b@rubble.com>', expected: { name: 'Barney Rubble', email: 'b@rubble.com', url: undefined } },
    { input: 'Barney Rubble', expected: { name: 'Barney Rubble', email: undefined, url: undefined } },
    { input: 'Barney Rubble (http://barnyrubble.tumblr.com/)', expected: { name: 'Barney Rubble', email: undefined, url: 'http://barnyrubble.tumblr.com/' } },
    { input: ' Barney Rubble(http://barnyrubble.tumblr.com/ )', expected: { name: 'Barney Rubble', email: undefined, url: 'http://barnyrubble.tumblr.com/' } },
    { input: '<b@rubble.com>(http://barnyrubble.tumblr.com/)', expected: { name: undefined, email: 'b@rubble.com', url: 'http://barnyrubble.tumblr.com/' } },
    { input: '<b@rubble.com> (http://barnyrubble.tumblr.com/)', expected: { name: undefined, email: 'b@rubble.com', url: 'http://barnyrubble.tumblr.com/' } },
    { input: '(http://barnyrubble.tumblr.com/)', expected: { name: undefined, email: undefined, url: 'http://barnyrubble.tumblr.com/' } },
    { input: '<b@rubble.com>', expected: { name: undefined, email: 'b@rubble.com', url: undefined } },
    { input: { name: 'Barney Rubble', email: 'b@rubble.com', url: 'http://barnyrubble.tumblr.com/' }, expected: { name: 'Barney Rubble', email: 'b@rubble.com', url: 'http://barnyrubble.tumblr.com/' } }
].forEach(testParams => {

    test(`normalizeContributor() works on string "${testParams.input}"`, () => {
        const contributor = normalizeContributor(testParams.input);
        expect(contributor).toEqual(testParams.expected);
    });

});

[
    { c1: null, c2: null },
    { c1: undefined, c2: undefined },
    { c1: null, c2: undefined },
    { c1: null, c2: '' },
    { c1: undefined, c2: '' },
    { c1: undefined, c2: {} },
    { c1: null, c2: {} },
    { c1: {}, c2: {} },
    { c1: '', c2: {} }
].forEach(testParams => {

    test('contributorEquals() is TRUE on edge case c1:' + testParams.c1 + ' c2:' + testParams.c2, () => {
        expect(contributorEquals(testParams.c1, testParams.c2)).toBeTruthy();
        expect(contributorEquals(testParams.c2, testParams.c1)).toBeTruthy();
    });

});

[
    { c1: 'Greg <greg@greg.com>', c2: { name: 'Toto', email: 'greg@greg.com' } },
    { c1: 'Greg <greg@greg.com>', c2: { name: 'Greg', email: 'user@domain.ext' } },
    { c1: 'Greg <greg@greg.com>', c2: { name: 'Greg' } },
    { c1: 'Greg <greg@greg.com>', c2: { email: 'greg@greg.com' } },
    { c1: '<greg@greg.com>', c2: { name: 'Toto', email: 'greg@greg.com' } },
    { c1: 'Greg ', c2: { name: 'Greg', email: 'user@domain.ext' } },
    { c1: 'Greg ', c2: { name: 'Greg' } },
    { c1: '<greg@greg.com>', c2: { email: 'greg@greg.com' } }
].forEach(testParams => {

    test(`contributorEquals() is TRUE on c1:${JSON.stringify(testParams.c2)} c2:${JSON.stringify(testParams.c2)}`, () => {
        expect(contributorEquals(testParams.c1, testParams.c2)).toBeTruthy();
        expect(contributorEquals(testParams.c2, testParams.c1)).toBeTruthy();
    });

});

[
    { c1: 'Greg <greg@greg.com>', c2: { name: 'Toto', email: 'toto@toto.com' } },
    { c1: 'Greg <greg@greg.com>', c2: { name: 'Toto' } },
    { c1: 'Greg <greg@greg.com>', c2: { email: 'toto@toto.com' } },
    { c1: '<greg@greg.com>', c2: { name: 'Toto' } },
    { c1: '<greg@greg.com>', c2: { email: 'user@domain.ext' } },
    { c1: 'Greg', c2: { name: 'Toto' } },
    { c1: 'Greg', c2: { email: 'user@domain.ext' } }
].forEach(testParams => {

    test(`contributorEquals() is FALSE on c1:${JSON.stringify(testParams.c2)} c2:${JSON.stringify(testParams.c2)}`, () => {
        expect(contributorEquals(testParams.c1, testParams.c2)).toBeFalsy();
        expect(contributorEquals(testParams.c2, testParams.c1)).toBeFalsy();
    });

});

[
    {
        contributors: [
            'Greg',
            null,
            { name: 'Greg', email: 'greg@greg.com' },
            { name: 'John' },
            { name: 'Gregory', email: 'greg@greg.com' },
            {}
        ],
        expected: [
            { name: 'Gregory', email: 'greg@greg.com' },
            { name: 'John' }
        ]
    },
    {
        contributors: [
            'Greg',
            'Greg',
            'Greg'
        ],
        expected: [
            { name: 'Greg' }
        ]
    },
    {
        contributors: [
            'infoAuthor',
            { name: 'infoMain1' },
            'infoMain2 <infoMain2email>',
            { name: 'Gilles' },
            { name: '001main' },
            '001main2 <002main2mail>',
            { name: 'John' },
            { name: '001main', email: '001mainmail' },
            '002main2 <002main2mail>'
        ],
        expected: [
            { name: 'infoAuthor' },
            { name: 'infoMain1' },
            { name: 'infoMain2', email: 'infoMain2email' },
            { name: 'Gilles' },
            { name: '001main', email: '001mainmail' },
            { name: '002main2', email: '002main2mail' },
            { name: 'John' }
        ]
    }
].forEach((testParams, i) => {

    test(`mergedContributors() Scenario #${i + 1}`, () => {
        const merged = mergedContributors(testParams.contributors);
        expect(merged).toEqual(testParams.expected);
    });

});

[
    {
        desc: 'only author',
        pkg: {
            author: { name: 'Greg' },
            maintainers: []
        },
        expected: [{ name: 'Greg' }]
    },
    {
        desc: 'only maintainers',
        pkg: {
            maintainers: [{ name: 'Greg' }]
        },
        expected: [{ name: 'Greg' }]
    },
    {
        desc: 'author and maintainers',
        pkg: {
            author: { name: 'Greg' },
            maintainers: [{ name: 'Jony' }, { name: 'Gulien' }]
        },
        expected: [{ name: 'Greg' }, { name: 'Jony' }, { name: 'Gulien' }]
    },
    {
        desc: 'duplicates in author and maintainers',
        pkg: {
            author: { name: 'Greg' },
            maintainers: [{ name: 'Greg', email: 'greg@greg.com' }, { name: 'Gulien' }]
        },
        expected: [{ name: 'Greg', email: 'greg@greg.com' }, { name: 'Gulien' }]
    }
].forEach(testParams => {

    test(`contributors() with ${testParams.desc}`, () => {
        const contribs = extractContributors(testParams.pkg);
        expect(contribs).toEqual(testParams.expected);
    });

});
