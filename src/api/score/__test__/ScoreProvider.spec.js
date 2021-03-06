import { ScoreProvider } from "../ScoreProvider";

const testPkg = {
    name: 'base',
    created: '2015-12-09T20:13:55.558Z',
    modified: '2016-12-09T20:13:55.558Z',
    contributors: [{ name: 'main1', email: 'main1mail' }, { name: 'main2', email: 'main2mail' }],
    downloads: 7000
};

const refDate = new Date(2016, 12, 21);

test('getScoreData() returns correct values', () => {
    const calc = new ScoreProvider();
    const pricingData = calc.getScoreData(testPkg);

    expect(pricingData).toEqual({
        birthDate: '2015-12-09T20:13:55.558Z',
        lastActivity: '2016-12-09T20:13:55.558Z',
        people: 2,
        downloads: 7000
    });
});

test('score() returns 10 when no similar packages', () => {
    const testSimilarPackages = [];
    const calc = new ScoreProvider();
    const score = calc.score(testPkg, testSimilarPackages, refDate);

    expect(score).toEqual(10);
});

test('score() returns 10 when identical packages', () => {
    const testSimilarPackages = [testPkg, testPkg];
    const calc = new ScoreProvider();
    const score = calc.score(testPkg, testSimilarPackages, refDate);

    expect(score).toEqual(10);
});

test('score() takes contributors into account #1', () => {
    const testSimilarPackages = [
        {
            created: '2015-12-09T20:13:55.558Z',
            modified: '2016-12-09T20:13:55.558Z',
            contributors: [
                { name: 'main3', email: 'main3mail' },
                { name: 'main1', email: 'main1mail' },
                { name: 'main2', email: 'main2mail' }
            ],
            downloads: 7000
        }
    ];

    const calc = new ScoreProvider();
    const score = calc.score(testPkg, testSimilarPackages, refDate);

    expect(score).toEqual(9);
});

test('score() takes contributors into account #2', () => {
    const testSimilarPackages = [
        {
            created: '2015-12-09T20:13:55.558Z',
            modified: '2016-12-09T20:13:55.558Z',
            contributors: [{ name: 'main2', email: 'main2mail' }],
            downloads: 7000
        }
    ];

    const calc = new ScoreProvider();
    const score = calc.score(testPkg, testSimilarPackages, refDate);

    expect(score).toEqual(10);
});

test('score() takes last activity into account #1', () => {
    const testSimilarPackages = [
        {
            created: '2015-12-09T20:13:55.558Z',
            modified: '2016-12-10T20:13:55.558Z',
            contributors: [{ name: 'main1', email: 'main1mail' }, { name: 'main2', email: 'main2mail' }],
            downloads: 7000
        }
    ];

    const calc = new ScoreProvider();
    const score = calc.score(testPkg, testSimilarPackages, refDate);

    expect(score).toEqual(10);
});

test('score() takes last activity into account #2', () => {
    const testSimilarPackages = [
        {
            created: '2015-12-09T20:13:55.558Z',
            modified: '2016-12-09T20:13:55.557Z',
            contributors: [{ name: 'main1', email: 'main1mail' }, { name: 'main2', email: 'main2mail' }],
            downloads: 7000
        }
    ];

    const calc = new ScoreProvider();
    const score = calc.score(testPkg, testSimilarPackages, refDate);

    expect(score).toEqual(10);
});

test('score() takes downloads into account #1', () => {
    const testSimilarPackages = [
        {
            created: '2015-12-09T20:13:55.558Z',
            modified: '2016-12-09T20:13:55.558Z',
            contributors: [{ name: 'main1', email: 'main1mail' }, { name: 'main2', email: 'main2mail' }],
            downloads: 15600
        }
    ];

    const calc = new ScoreProvider();
    const score = calc.score(testPkg, testSimilarPackages, refDate);

    expect(score).toEqual(7.8);
});

test('score() takes downloads into account #2', () => {
    const testSimilarPackages = [
        {
            created: '2015-12-09T20:13:55.558Z',
            modified: '2016-12-09T20:13:55.558Z',
            contributors: [{ name: 'main1', email: 'main1mail' }, { name: 'main2', email: 'main2mail' }],
            downloads: 6900
        }
    ];

    const calc = new ScoreProvider();
    const score = calc.score(testPkg, testSimilarPackages, refDate);

    expect(score).toEqual(10);
});

test('score() takes birth date into account #1', () => {
    const testSimilarPackages = [
        {
            created: '2014-12-09T20:13:55.558Z',
            modified: '2016-12-09T20:13:55.558Z',
            contributors: [{ name: 'main1', email: 'main1mail' }, { name: 'main2', email: 'main2mail' }],
            downloads: 7000
        }
    ];

    const calc = new ScoreProvider();
    const score = calc.score(testPkg, testSimilarPackages, refDate);

    expect(score).toEqual(10);
});

test('score() takes birth date into account #2', () => {
    const testSimilarPackages = [
        {
            created: '2016-12-10T20:13:55.558Z',
            modified: '2016-12-09T20:13:55.558Z',
            contributors: [{ name: 'main1', email: 'main1mail' }, { name: 'main2', email: 'main2mail' }],
            downloads: 7000
        }
    ];

    const calc = new ScoreProvider();
    const score = calc.score(testPkg, testSimilarPackages, refDate);

    expect(score).toEqual(9.1);
});
