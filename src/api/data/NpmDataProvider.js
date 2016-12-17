import { NpmApi } from "./NpmApi";
import _ from "lodash";
import { mergedContributors, extractContributors } from "../helper/contributorHelper";

export class NpmDataProvider {
    constructor(npmApi) {
        this.npmApi = npmApi;
    }

    /**
     * Retrieves all versioned package of given name.
     * @param packageName NPM package name.
     */
    async get(packageName) {
        const [info, downloads] = await Promise.all([
            this.npmApi.info(packageName),
            this.npmApi.downloads(packageName, NpmApi.TIME_POINT_LAST_MONTH)
        ]);

        if (!info.name) return null;

        const lastVersion = _(info.versions).keys().last();
        const lastVersionNode = info.versions && info.versions[lastVersion];
        const dependencies = lastVersionNode && _.keys(lastVersionNode.dependencies);
        let contributors = _(info.versions)
            .keys()
            .sortBy() // ensure sorted versions to override contributor info with latest
            .map(v => extractContributors(info.versions[v]))
            .flatten()
            .value();
        contributors = mergedContributors(contributors);
        const keywords = (lastVersionNode && lastVersionNode.keywords) || [];

        return {
            name: info.name,
            description: info.description || null,
            version: lastVersion,
            created: info.time && info.time.created,
            modified: info.time && info.time.modified,
            contributors,
            repository: typeof info.repository == 'string' ? info.repository : (info.repository && info.repository.url) || null,
            dependencies,
            downloads: (downloads && downloads.downloads) || 0,
            keywords
        };
    }
}
