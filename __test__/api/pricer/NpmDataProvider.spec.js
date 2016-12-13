import { NpmDataProvider } from "../../../src/api/data/NpmDataProvider";

test('get() combines npm api data correctly', async () => {
    const npmApi = {
        info: jest.fn(() => ({})),
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
        maintainers: [{ name: 'infoMain1' },'infoMain2 <infoMain2email>'],
        repository: { url: 'infoRepoUrl' },
        versions: {
            'v1': { maintainers: [{ name: 'v1Main1' }, 'v1Main2 <v1Main2email>'] },
            'v2': { maintainers: [{ name: 'v2Main1' }, 'v2Main2 <v2Main2email>'], dependencies: [{ dep1: 'vdep1', dep2: 'vdep2' }] }
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
        author: { name: infoData.author },
        maintainers: [{ name: 'infoMain1' }, { name: 'infoMain2', email: 'infoMain2email' }],
        repository: infoData.repository.url,
        dependencies: Object.keys(infoData.versions.v2.dependencies),
        downloads: downloadsData.downloads
    });
});

test('get() retrieves repository when string', async () => {
    const infoData = {
        repository: 'infoRepoUrl'
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
