import { NpmDataProvider } from "../../../src/api/pricer/NpmDataProvider";

test('get() combines npm api data correctly', async () => {
    const npmApi = {
        info: jest.fn(() => ({ time: {}, versions: {} })),
        downloads: jest.fn(() => ({}))
    };
    const provider = new NpmDataProvider(npmApi)
    await provider.get('pkg');

    expect(npmApi.info).toHaveBeenCalledWith('pkg');
    expect(npmApi.downloads).toHaveBeenCalledWith('pkg', 'last-month');
});

test('get() retrieves expected data from npm api', async () => {
    const infoData = {
        name: 'infoName',
        description: 'infoDesc',
        time: {
            created: 'infoTimeCreated',
            modified: 'infoTimeModified',
            v1: 'infoTimev1',
            v2: 'infoTimev2'
        },
        author: 'infoAuthor',
        maintainers: [{ name: 'infoMain1' }, { name: 'infoMain2' }],
        repository: { url: 'infoRepoUrl' },
        dependencies: [{ dep1: 'vdep1', dep2: 'vdep2' }],
        versions: {
            'v1': { maintainers: [{ name: 'v1Main1' }, { name: 'v1Main2' }] },
            'v2': { maintainers: [{ name: 'v2Main1' }, { name: 'v2Main2' }] }
        }
    }
    const downloadsData = {
        downloads: 7001
    };

    const npmApi = {
        info: jest.fn(() => infoData),
        downloads: jest.fn(() => downloadsData)
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg).toEqual({
        name: infoData.name,
        description: infoData.description,
        created: infoData.time.created,
        modified: infoData.time.modified,
        author: infoData.author,
        maintainers: infoData.maintainers,
        repository: infoData.repository.url,
        dependencies: infoData.dependencies,
        versions: Object.keys(infoData.versions).reduce((prev, cur) => {
            let npmVersion = infoData.versions[cur];
            prev[cur] = {
                created: infoData.time[cur],
                maintainers: npmVersion.maintainers
            }
            return prev;
        }, {}),
        downloads: downloadsData.downloads
    });
});

test('get() retrieves repository when string', async () => {
    const infoData = {
        time: {
            created: 'infoTimeCreated',
            modified: 'infoTimeModified'
        },
        repository:  'infoRepoUrl' ,
        versions: {
        }
    }
    const downloadsData = {
        downloads: 7001
    };

    const npmApi = {
        info: jest.fn(() => infoData),
        downloads: jest.fn(() => downloadsData)
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.repository).toEqual('infoRepoUrl');
});
