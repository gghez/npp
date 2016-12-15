import { NpmDataProvider } from "../NpmDataProvider";

test('get() combines npm api data correctly', async () => {
    const npmApi = {
        info: jest.fn(() => Promise.resolve({})),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi)
    await provider.get('pkg');

    expect(npmApi.info).toHaveBeenCalledWith('pkg');
    expect(npmApi.downloads).toHaveBeenCalledWith('pkg', 'last-month');
});

test('get() retrieves uses api.info() created', async () => {
    const infoData = {
        time: {
            created: 'infoTimeCreated'
        }
    }

    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.created).toEqual(infoData.time.created);
});

test('get() retrieves uses api.info() modified', async () => {
    const infoData = {
        time: {
            modified: 'infoTimeCreated'
        }
    }

    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.modified).toEqual(infoData.time.modified);
});

test('get() retrieves dependencies from last version', async () => {
    const infoData = {
        versions: {
            'v1': { maintainers: [{ name: 'v1Main1' }, 'v1Main2 <v1Main2email>'] },
            'v2': { maintainers: [{ name: 'v2Main1' }, 'v2Main2 <v2Main2email>'], dependencies: [{ dep1: 'vdep1', dep2: 'vdep2' }] }
        }
    }

    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.dependencies).toEqual(Object.keys(infoData.versions.v2.dependencies));
});

test('get() retrieves contributors from author and maintainers in all versions', async () => {
    const infoData = {
        author: 'infoAuthor',
        maintainers: [{ name: 'infoMain1' }, 'infoMain2 <infoMain2email>'],
        versions: {
            '0.0.1': {
                author: { name: 'Gilles' },
                maintainers: [{ name: '001main' }, '001main2 <002main2mail>']
            },
            '0.0.2': {
                author: { name: 'John' },
                maintainers: [{ name: '001main', email: '001mainmail' }, '002main2 <002main2mail>']
            }
        }
    }
    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.contributors).toEqual([
        { name: 'Gilles' },
        { name: '001main', email: '001mainmail' },
        { name: '002main2', email: '002main2mail' },
        { name: 'John' },
        { name: 'infoAuthor' },
        { name: 'infoMain1' },
        { name: 'infoMain2', email: 'infoMain2email' }
    ]);
});

test('get() uses api.info() name', async () => {
    const infoData = {
        name: 'infoName'
    }
    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.name).toEqual(infoData.name);
});

test('get() uses api.info() description', async () => {
    const infoData = {
        description: 'infoDesc'
    }
    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.description).toEqual(infoData.description);
});

test('get() retrieves dependencies as [] if not present', async () => {
    const infoData = {
        versions: {
            'v1': { maintainers: [{ name: 'v1Main1' }, 'v1Main2 <v1Main2email>'] }
        }
    }
    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.dependencies).toEqual([]);
});

test('get() retrieves contributors as [] if no author or maintainer', async () => {
    const npmApi = {
        info: jest.fn(() => Promise.resolve({})),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.contributors).toEqual([]);
});

test('get() retrieves contributors as [author] if no maintainer', async () => {
    const infoData = {
        author: 'Greg <greg@greg.com>'
    }

    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.contributors).toEqual([{ name: 'Greg', email: 'greg@greg.com' }]);
});

test('get() retrieves contributors as maintainers if no author', async () => {
    const infoData = {
        maintainers: ['Greg <greg@greg.com>']
    }
    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.contributors).toEqual([{ name: 'Greg', email: 'greg@greg.com' }]);
});

test('get() dedupes contributors in maintainers and author', async () => {
    const infoData = {
        author: { name: 'Greg', email: 'greg@greg.com' },
        maintainers: ['Greg <greg@greg.com>', { name: 'Fake John' }]
    }

    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.contributors).toEqual([
        { name: 'Greg', email: 'greg@greg.com' },
        { name: 'Fake John' }
    ]);
});

test('get() retrieves repository when string', async () => {
    const infoData = {
        repository: 'infoRepoUrl'
    }
    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.repository).toEqual('infoRepoUrl');
});

test('get() retrieves repository when object', async () => {
    const infoData = {
        repository: { url: 'infoRepoUrl' }
    }
    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.repository).toEqual('infoRepoUrl');
});

test('get() retrieves downloads', async () => {
    const downloadsData = { downloads: 7002 };
    const npmApi = {
        info: jest.fn(() => Promise.resolve({})),
        downloads: jest.fn(() => Promise.resolve(downloadsData))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.downloads).toBe(downloadsData.downloads);
});


test('get() retrieves downloads as 0 when not present', async () => {
    const npmApi = {
        info: jest.fn(() => Promise.resolve({})),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.downloads).toBe(0);
});
