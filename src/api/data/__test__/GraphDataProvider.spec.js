import { GraphDataProvider } from "../GraphDataProvider";
import _ from "lodash";

const fakeRecords = [{ _fields: [{}] }];

const fakeSession = {
    run: jest.fn(() => Promise.resolve({ records: fakeRecords })),
    close: jest.fn(_.noop)
};
const fakeDriver = {
    session: jest.fn(() => fakeSession)
};

beforeEach(() => {
    fakeDriver.session.mockClear();
    fakeSession.run.mockClear();
    fakeSession.run.mockImplementation(() => Promise.resolve({ records: fakeRecords }));
});

[
    '',
    ' ',
    '\t\n',
    '  \r',
    null,
    undefined,
    {},
    { toto: 5 },
    [],
    ['toto'],
    0,
    13
].forEach(edgeValue => {

    test(`get(${JSON.stringify(edgeValue)}) should fail.`, async () => {
        const provider = new GraphDataProvider(fakeDriver);

        let hasFailed;
        try {
            await provider.get(edgeValue);
            hasFailed = false;
        } catch (e) {
            hasFailed = true;
        }

        if (!hasFailed) {
            throw new Error('Should have failed.');
        }
    });

});

test('get() should close driver session when run failed', async () => {
    const provider = new GraphDataProvider(fakeDriver);

    fakeSession.run.mockImplementation(() => { throw 666; });
    try {
        await provider.get('pkg');
    } catch (e) { }

    expect(fakeSession.close).toHaveBeenCalled();
});

test('get() should rely on neo4j request', async () => {
    const provider = new GraphDataProvider(fakeDriver);
    await provider.get('pkg');

    expect(fakeDriver.session).toHaveBeenCalled();
    expect(fakeSession.run.mock.calls[0][0]).toEqual(`MATCH (p:Package {name:{packageName}}) RETURN p`);
    expect(fakeSession.run.mock.calls[0][1]).toEqual({ packageName: 'pkg' });
    expect(fakeSession.close).toHaveBeenCalled();
});
