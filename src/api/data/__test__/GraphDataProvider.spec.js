import { GraphDataProvider } from "../GraphDataProvider";
import _ from "lodash";

const fakeResult = {
    "records": [
        { "keys": ["p", "dependencies", "contributors"], "length": 3, "_fields": [{ "identity": { "low": 198, "high": 0 }, "labels": ["Package"], "properties": { "downloads": 677985, "created": "2013-03-16T00:39:23.779Z", "name": "babel", "modified": "2016-11-29T02:07:43.308Z", "description": "Turn ES6 code into readable vanilla ES5 with source maps", "repository": "https://github.com/babel/babel/tree/master/packages/babel", "version": "5.8.38" } }, ["commander", "convert-source-map", "babel-core", "chokidar", "lodash", "output-file-sync", "fs-readdir-recursive", "glob", "source-map", "slash", "path-exists", "path-is-absolute"], ["hzoo", "amasad", "sebmck", "missinglink", "thejameskyle", "loganfsmyth", "jmm"]], "_fieldLookup": { "p": 0, "dependencies": 1, "contributors": 2 } },
        { "keys": ["p", "dependencies", "contributors"], "length": 3, "_fields": [{ "identity": { "low": 198, "high": 0 }, "labels": ["Package"], "properties": { "downloads": 677985, "created": "2013-03-16T00:39:23.779Z", "name": "babel", "modified": "2016-11-29T02:07:43.308Z", "description": "Turn ES6 code into readable vanilla ES5 with source maps", "repository": "https://github.com/babel/babel/tree/master/packages/babel", "version": "5.8.38" } }, ["commander", "convert-source-map", "babel-core", "chokidar", "lodash", "output-file-sync", "fs-readdir-recursive", "glob", "source-map", "slash", "path-exists", "path-is-absolute"], ["hzoo", "amasad", "sebmck", "missinglink", "thejameskyle", "loganfsmyth", "jmm"]], "_fieldLookup": { "p": 0, "dependencies": 1, "contributors": 2 } }
    ]
};

const fakeSession = {
    run: jest.fn(() => Promise.resolve(fakeResult)),
    close: jest.fn(_.noop)
};
const fakeDriver = {
    session: jest.fn(() => fakeSession)
};

beforeEach(() => {
    fakeDriver.session.mockClear();
    fakeSession.run.mockClear();
    fakeSession.run.mockImplementation(() => Promise.resolve(fakeResult));
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
    expect(fakeSession.run.mock.calls[0][0]).toEqual(`
MATCH (p:Package {name:{packageName}})-[:DEPENDS_ON]->(d:Package)
WITH p, collect(d.name) as dependencies
MATCH (c:Person)-[:CONTRIBUTES_ON]->(p)
RETURN p, dependencies, collect(c.name) as contributors`);
    expect(fakeSession.run.mock.calls[0][1]).toEqual({ packageName: 'pkg' });
    expect(fakeSession.close).toHaveBeenCalled();
});

test('get() should parse neo4j result correctly', async () => {
    const provider = new GraphDataProvider(fakeDriver);
    const pkg = await provider.get('pkg');

    expect(pkg).toEqual(_.assign(
        fakeResult.records[0]._fields[0].properties,
        { dependencies: fakeResult.records[0]._fields[1] },
        { contributors: fakeResult.records[0]._fields[2] }
    ));

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

    test(`search(${JSON.stringify(edgeValue)}) should fail.`, async () => {
        const provider = new GraphDataProvider(fakeDriver);

        let hasFailed;
        try {
            await provider.search(edgeValue);
            hasFailed = false;
        } catch (e) {
            hasFailed = true;
        }

        if (!hasFailed) {
            throw new Error('Should have failed.');
        }
    });

});

test('search() should close driver session when run failed', async () => {
    const provider = new GraphDataProvider(fakeDriver);

    fakeSession.run.mockImplementation(() => { throw 666; });
    try {
        await provider.search('pkg');
    } catch (e) { }

    expect(fakeSession.close).toHaveBeenCalled();
});

test('search() should rely on neo4j request', async () => {
    const provider = new GraphDataProvider(fakeDriver);
    await provider.search('pkg');

    expect(fakeDriver.session).toHaveBeenCalled();
    expect(fakeSession.run.mock.calls[0][0]).toEqual(`
MATCH (p:Package)-[:DEPENDS_ON]->(d:Package)
WHERE p.name CONTAINS {terms} OR p.description CONTAINS {terms} OR p.keywords CONTAINS {terms}
WITH p, collect(d.name) as dependencies
MATCH (c:Person)-[:CONTRIBUTES_ON]->(p)
RETURN p, dependencies, collect(c.name) as contributors`);
    expect(fakeSession.run.mock.calls[0][1]).toEqual({ terms: 'pkg' });
    expect(fakeSession.close).toHaveBeenCalled();
});

test('search() should parse neo4j result correctly', async () => {
    const provider = new GraphDataProvider(fakeDriver);
    const packages = await provider.search('pkg');

    expect(packages).toEqual(fakeResult.records.map(record => _.assign(
        record._fields[0].properties,
        { dependencies: record._fields[1] },
        { contributors: record._fields[2] }
    )));

});
