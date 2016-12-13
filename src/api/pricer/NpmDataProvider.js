import { NpmApi } from "../npm/NpmApi";

export class NpmDataProvider {
    constructor(npmApi) {
        this.npmApi = npmApi;
    }

    get(packageName) {
        return Promise.all([
            this.npmApi.info(packageName),
            this.npmApi.downloads(packageName, NpmApi.TIME_POINT_LAST_MONTH)
        ]).then(([info, downloads]) => {
            return {
                name: info.name,
                description: info.description,
                created: info.time.created,
                modified: info.time.modified,
                author: info.author,
                maintainers: info.maintainers,
                repository: typeof info.repository == 'string' ? info.repository : (info.repository && info.repository.url),
                dependencies: info.dependencies,
                versions: Object.keys(info.versions).reduce((prev, cur) => {
                    let npmVersion = info.versions[cur];
                    prev[cur] = {
                        created: info.time[cur],
                        maintainers: npmVersion.maintainers
                    }
                    return prev;
                }, {}),
                downloads: downloads.downloads
            };
        });
    }
}
