import { NpmPackageTransformer } from "../NpmPackageTransformer";
import { NpmDataProvider } from "../../api/data/NpmDataProvider";
import _ from "lodash";

const fakeProvider = {
    get: jest.fn(() => ({}))
};

const fakeRecords = [{ _fields: [{}] }];

const fakeSession = {
    run: jest.fn(() => Promise.resolve({ records: fakeRecords })),
    close: jest.fn(_.noop)
};
const fakeDriver = {
    session: jest.fn(() => fakeSession)
};

beforeEach(() => {
    fakeProvider.get.mockClear();
    fakeProvider.get.mockImplementation(() => ({}));
    fakeDriver.session.mockClear();
    fakeSession.run.mockClear();
});

test('importPackage() processes import operations once.', async () => {
    const npmApi = {
        info: jest.fn(() => Promise.resolve({ name: 'infoName' })),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const transformer = new NpmPackageTransformer(provider, fakeDriver);

    await transformer.importPackage('pkg', { silent: true });
    await transformer.importPackage('pkg', { silent: true });

    expect(npmApi.info).toHaveBeenCalledTimes(1);
    expect(npmApi.downloads).toHaveBeenCalledTimes(1);
    expect(fakeSession.run).toHaveBeenCalledTimes(1);
});

test('importPackage() relies on data provider.', async () => {
    const transformer = new NpmPackageTransformer(fakeProvider, fakeDriver);

    await transformer.importPackage('pkg', { silent: true });

    expect(fakeProvider.get).toHaveBeenCalledWith('pkg');
});

[
    {
        desc: 'without dependencies nor contributors',
        pkg: {
            name: 'pacman',
            description: 'A game',
            version: '1.0.3',
            created: 'createdAt',
            modified: 'modifiedAt',
            repository: 'gitrepoforinstance',
            downloads: 7000
        },
        expected: `
MERGE (p:Package {name:{name}})


SET 
    p.description = {description},
    p.version = {version},
    p.created = {created},
    p.modified = {modified},
    p.repository = {repository},
    p.downloads = {downloads},
    p.keywords = {keywords}
RETURN p`
    },
    {
        desc: 'without dependencies but contributors',
        pkg: {
            name: 'pacman',
            description: 'A game',
            version: '1.0.3',
            created: 'createdAt',
            modified: 'modifiedAt',
            repository: 'gitrepoforinstance',
            downloads: 7000,
            contributors: [
                { name: 'Greg', email: 'greg@greg.com', url: 'http://greg.com/' },
                { name: 'John', email: 'john@doe.com', url: 'http://john.com/' }
            ]
        },
        expected: `
MERGE (p:Package {name:{name}})

MERGE (c0:Person {name:{c0Name}}) MERGE (c0)-[:CONTRIBUTES_ON]->(p)
MERGE (c1:Person {name:{c1Name}}) MERGE (c1)-[:CONTRIBUTES_ON]->(p)
SET c0.email = {c0Email},
    c1.email = {c1Email},
    p.description = {description},
    p.version = {version},
    p.created = {created},
    p.modified = {modified},
    p.repository = {repository},
    p.downloads = {downloads},
    p.keywords = {keywords}
RETURN p`
    },
    {
        desc: 'without contributors but dependencies',
        pkg: {
            name: 'pacman',
            description: 'A game',
            version: '1.0.3',
            created: 'createdAt',
            modified: 'modifiedAt',
            repository: 'gitrepoforinstance',
            downloads: 7000,
            dependencies: ['lodash', 'express']
        },
        expected: `
MERGE (p:Package {name:{name}})
MERGE (d0:Package {name:"lodash"}) MERGE (p)-[:DEPENDS_ON]->(d0)
MERGE (d1:Package {name:"express"}) MERGE (p)-[:DEPENDS_ON]->(d1)

SET 
    p.description = {description},
    p.version = {version},
    p.created = {created},
    p.modified = {modified},
    p.repository = {repository},
    p.downloads = {downloads},
    p.keywords = {keywords}
RETURN p`
    },
    {
        desc: 'with contributors and dependencies',
        pkg: {
            name: 'pacman',
            description: 'A game',
            version: '1.0.3',
            created: 'createdAt',
            modified: 'modifiedAt',
            repository: 'gitrepoforinstance',
            downloads: 7000,
            dependencies: ['lodash', 'express'],
            contributors: [
                { name: 'Greg', email: 'greg@greg.com', url: 'http://greg.com/' },
                { name: 'John', email: 'john@doe.com', url: 'http://john.com/' }
            ]
        },
        expected: `
MERGE (p:Package {name:{name}})
MERGE (d0:Package {name:"lodash"}) MERGE (p)-[:DEPENDS_ON]->(d0)
MERGE (d1:Package {name:"express"}) MERGE (p)-[:DEPENDS_ON]->(d1)
MERGE (c0:Person {name:{c0Name}}) MERGE (c0)-[:CONTRIBUTES_ON]->(p)
MERGE (c1:Person {name:{c1Name}}) MERGE (c1)-[:CONTRIBUTES_ON]->(p)
SET c0.email = {c0Email},
    c1.email = {c1Email},
    p.description = {description},
    p.version = {version},
    p.created = {created},
    p.modified = {modified},
    p.repository = {repository},
    p.downloads = {downloads},
    p.keywords = {keywords}
RETURN p`
    },
    {
        desc: 'with contributors, dependencies and keywords',
        pkg: {
            name: 'pacman',
            description: 'A game',
            version: '1.0.3',
            created: 'createdAt',
            modified: 'modifiedAt',
            repository: 'gitrepoforinstance',
            downloads: 7000,
            dependencies: ['lodash', 'express'],
            contributors: [
                { name: 'Greg', email: 'greg@greg.com', url: 'http://greg.com/' },
                { name: 'John', email: 'john@doe.com', url: 'http://john.com/' }
            ],
            keywords: ['titi', 'toto', 'tata']
        },
        expected: `
MERGE (p:Package {name:{name}})
MERGE (d0:Package {name:"lodash"}) MERGE (p)-[:DEPENDS_ON]->(d0)
MERGE (d1:Package {name:"express"}) MERGE (p)-[:DEPENDS_ON]->(d1)
MERGE (c0:Person {name:{c0Name}}) MERGE (c0)-[:CONTRIBUTES_ON]->(p)
MERGE (c1:Person {name:{c1Name}}) MERGE (c1)-[:CONTRIBUTES_ON]->(p)
SET c0.email = {c0Email},
    c1.email = {c1Email},
    p.description = {description},
    p.version = {version},
    p.created = {created},
    p.modified = {modified},
    p.repository = {repository},
    p.downloads = {downloads},
    p.keywords = {keywords}
RETURN p`
    }
].forEach(testParams => {

    test(`importPackage() generates cypher ${testParams.desc}.`, async () => {
        const transformer = new NpmPackageTransformer(fakeProvider, fakeDriver);

        fakeProvider.get.mockImplementation(() => Promise.resolve(testParams.pkg));

        // silent: true to avoid console.log distraction
        await transformer.importPackage('pkg', { silent: true });

        expect(fakeDriver.session).toHaveBeenCalled();
        expect(fakeSession.run.mock.calls[0][0]).toEqual(testParams.expected);

        const expectedParams = {
            name: testParams.pkg.name,
            description: testParams.pkg.description,
            version: testParams.pkg.version,
            created: testParams.pkg.created,
            modified: testParams.pkg.modified,
            repository: testParams.pkg.repository,
            downloads: testParams.pkg.downloads,
            keywords: (testParams.pkg.keywords || []).join(',')
        };

        if (Array.isArray(testParams.pkg.contributors)) {
            testParams.pkg.contributors.forEach((c, i) => {
                expectedParams[`c${i}Name`] = c.name;
                expectedParams[`c${i}Email`] = c.email;
            });
        }

        expect(fakeSession.run.mock.calls[0][1]).toEqual(expectedParams);
        expect(fakeSession.close).toHaveBeenCalled();
    });

});
