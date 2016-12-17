import { NpmDataProvider } from "../NpmDataProvider";
import _ from "lodash";

test('get() combines npm api data correctly', async () => {
    const npmApi = {
        info: jest.fn(() => Promise.resolve({ name: 'infoName' })),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi)
    await provider.get('pkg');

    expect(npmApi.info).toHaveBeenCalledWith('pkg');
    expect(npmApi.downloads).toHaveBeenCalledWith('pkg', 'last-month');
});

test('get() uses api.info() created', async () => {
    const infoData = {
        name: 'infoName',
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

test('get() uses api.info() modified', async () => {
    const infoData = {
        name: 'infoName',
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
        name: 'infoName',
        versions: {
            'v1': { maintainers: [{ name: 'v1Main1' }, 'v1Main2 <v1Main2email>'] },
            'v2': {
                maintainers: [{ name: 'v2Main1' }, 'v2Main2 <v2Main2email>'],
                dependencies: [{ dep1: 'vdep1', dep2: 'vdep2' }]
            }
        }
    }

    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.dependencies).toEqual(_.keys(infoData.versions.v2.dependencies));
});

test('get() retrieves version from last version', async () => {
    const infoData = {
        name: 'infoName',
        versions: {
            '0.0.1': { version: '0.0.1' },
            '0.0.2': { version: '0.0.2' }
        }
    }

    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.version).toEqual(infoData.versions['0.0.2'].version);
});

test('get() retrieves contributors from author and maintainers in all versions', async () => {
    const infoData = {
        name: 'infoName',
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
        { name: 'John' }
    ]);
});

test('get() returns null if api.info() name is falsy', async () => {
    const npmApi = {
        info: jest.fn(() => Promise.resolve({})),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg).toBeNull();
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

test('get() uses api.info() keywords of last version', async () => {
    const infoData = {
        name: 'infoName',
        versions: {
            v1: { keywords: ['titi', 'tata'] },
            v2: { keywords: ['toto'] }
        }
    }
    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.keywords).toEqual(infoData.versions.v2.keywords);
});

test('get() uses [] as keywords when not present', async () => {
    const infoData = {
        name: 'infoName',
        versions: {
            v1: { keywords: ['titi', 'tata'] },
            v2: {}
        }
    }
    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.keywords).toEqual([]);
});

test('get() uses null for description if not present', async () => {
    const npmApi = {
        info: jest.fn(() => Promise.resolve({ name: 'infoName' })),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.description).toBeNull();
});

test('get() uses api.info() description', async () => {
    const infoData = {
        description: 'infoDesc',
        name: 'infoName'
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
        name: 'infoName',
        versions: {
            v1: { maintainers: [{ name: 'v1Main1' }, 'v1Main2 <v1Main2email>'] }
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
        info: jest.fn(() => Promise.resolve({ name: 'infoName' })),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.contributors).toEqual([]);
});

test('get() retrieves contributors as [author] if no maintainer', async () => {
    const infoData = {
        name: 'infoName',
        author: 'Fake John<fake.john@domain.ext>',
        maintainers: ['Greg <greg@greg.com>'],
        versions: {
            v1: { author: 'John' }
        }
    }

    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.contributors).toEqual([{ name: 'John' }]);
});

test('get() retrieves contributors as maintainers if no author', async () => {
    const infoData = {
        name: 'infoName',
        author: 'Fake John<fake.john@domain.ext>',
        maintainers: ['Greg <greg@greg.com>'],
        versions: {
            v1: { maintainers: [{ name: 'v1Main1' }, 'v1Main2 <v1Main2email>'] }
        }
    }
    const npmApi = {
        info: jest.fn(() => Promise.resolve(infoData)),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.contributors).toEqual([{ name: 'v1Main1' }, { name: 'v1Main2', email: 'v1Main2email' }]);
});

test('get() dedupes contributors in maintainers and author', async () => {
    const infoData = {
        name: 'infoName',
        author: 'Fake John<fake.john@domain.ext>',
        versions: {
            v1: {
                author: { name: 'Greg', email: 'greg@greg.com' },
                maintainers: ['Greg <greg@greg.com>', { name: 'Fake John' }]
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
        { name: 'Greg', email: 'greg@greg.com' },
        { name: 'Fake John' }
    ]);
});

test('get() retrieves repository as null when not present', async () => {
    const npmApi = {
        info: jest.fn(() => Promise.resolve({ name: 'infoName' })),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.repository).toBeNull();
});

test('get() retrieves repository when string', async () => {
    const infoData = {
        name: 'infoName',
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
        name: 'infoName',
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
        info: jest.fn(() => Promise.resolve({ name: 'infoName' })),
        downloads: jest.fn(() => Promise.resolve(downloadsData))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.downloads).toBe(downloadsData.downloads);
});


test('get() retrieves downloads as 0 when not present', async () => {
    const npmApi = {
        info: jest.fn(() => Promise.resolve({ name: 'infoName' })),
        downloads: jest.fn(() => Promise.resolve({}))
    };
    const provider = new NpmDataProvider(npmApi);
    const pkg = await provider.get('pkg');

    expect(pkg.downloads).toBe(0);
});
