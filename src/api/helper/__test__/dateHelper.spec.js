import { daysBetween } from "../dateHelper";

[
    { d1: '2015-12-09T20:13:55.558Z', d2: '2015-12-07T20:13:55.558Z', expected: 2 },
    { d1: '2015-12-09T20:13:55.558Z', d2: '2015-12-09T20:13:55.558Z', expected: 0 },
    { d1: '2015-12-09T20:13:55.558Z', d2: '2015-12-09T10:13:55.558Z', expected: 0 },
    { d1: '2015-12-09T20:13:55.558Z', d2: '2015-12-07T10:13:55.558Z', expected: 2 },
    { d1: '2015-12-09T20:13:55.558Z', d2: '2015-12-07T07:13:55.558Z', expected: 3 },
    { d1: new Date('2015-12-09T20:13:55.558Z'), d2: '2015-12-07T20:13:55.558Z', expected: 2 },
    { d1: '2015-12-09T20:13:55.558Z', d2: new Date('2015-12-07T20:13:55.558Z'), expected: 2 },
    { d1: new Date('2015-12-09T20:13:55.558Z'), d2: new Date('2015-12-07T20:13:55.558Z'), expected: 2 }
].forEach(testParams => {

    test(`daysBetween('${testParams.d1}', '${testParams.d2}') equals ${testParams.expected}`, () => {
        expect(daysBetween(testParams.d1, testParams.d2)).toBe(testParams.expected);
    });

});
