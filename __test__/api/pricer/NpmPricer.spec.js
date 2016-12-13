import { NpmPricer } from "../../../src/api/pricer/NpmPricer";

const testPkg = {
    modified: '2016-12-09T20:13:55.558Z',
    author: {
        name: 'main3',
        email: 'main1mail'
    },
    maintainers: [{ name: 'main1', email: 'main1mail' }, { name: 'main2', email: 'main2mail' }],
    downloads: 7000
};

test('getPricingData() returns correct values', () => {
    const pricer = new NpmPricer();
    const pricingData = pricer.getPricingData(testPkg);

    expect(pricingData).toEqual({
        lastActivity: '2016-12-09T20:13:55.558Z',
        people: 2,
        downloads: 7000
    });
});

test('price() returns correct values', () => {
    const pricer = new NpmPricer();
    const price = pricer.price(testPkg);

    expect(price).toEqual()
});
