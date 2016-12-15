import { NpmPackageTransformer } from "../NpmPackageTransformer";
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
    fakeDriver.session.mockClear();
    fakeSession.run.mockClear();
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
    p.downloads = {downloads}
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

MERGE (m0:Person {name:"Greg"})-[:CONTRIBUTES_ON]->(p)
MERGE (m1:Person {name:"John"})-[:CONTRIBUTES_ON]->(p)
SET m0.email = "greg@greg.com",
    m1.email = "john@doe.com",
    p.description = {description},
    p.version = {version},
    p.created = {created},
    p.modified = {modified},
    p.repository = {repository},
    p.downloads = {downloads}
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
MERGE (p)-[:DEPENDS_ON]->(:Package {name:"lodash"})
MERGE (p)-[:DEPENDS_ON]->(:Package {name:"express"})

SET 
    p.description = {description},
    p.version = {version},
    p.created = {created},
    p.modified = {modified},
    p.repository = {repository},
    p.downloads = {downloads}
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
MERGE (p)-[:DEPENDS_ON]->(:Package {name:"lodash"})
MERGE (p)-[:DEPENDS_ON]->(:Package {name:"express"})
MERGE (m0:Person {name:"Greg"})-[:CONTRIBUTES_ON]->(p)
MERGE (m1:Person {name:"John"})-[:CONTRIBUTES_ON]->(p)
SET m0.email = "greg@greg.com",
    m1.email = "john@doe.com",
    p.description = {description},
    p.version = {version},
    p.created = {created},
    p.modified = {modified},
    p.repository = {repository},
    p.downloads = {downloads}
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
        expect(fakeSession.run.mock.calls[0][1]).toEqual(_.pick(testParams.pkg, [
            'name',
            'description',
            'version',
            'created',
            'modified',
            'repository',
            'downloads'
        ]));
        expect(fakeSession.close).toHaveBeenCalled();
    });

});
