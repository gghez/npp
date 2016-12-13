import { NpmPricer } from "../../../src/api/pricer/NpmPricer";

test('getPricingData() returns correct values', () => {
    const pricer = new NpmPricer();
    const pricingData = pricer.getPricingData({
        modified: '2016-12-09T20:13:55.558Z',
        author: {
            name: 'main3',
            email: 'main1mail'
        },
        maintainers: [{ name: 'main1', email: 'main1mail' }, { name: 'main2', email: 'main2mail' }],
        downloads: 7000
    });

    expect(pricingData).toEqual({
        lastActivity: '2016-12-09T20:13:55.558Z',
        people: 2,
        downloads: 7000
    });
});
