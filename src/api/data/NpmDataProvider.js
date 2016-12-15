import { NpmApi } from "./NpmApi";
import _ from "lodash";
import { mergedContributors } from "../helper/contributorHelper";

export class NpmDataProvider {
    constructor(npmApi) {
        this.npmApi = npmApi;
    }

    /**
     * Extracts a contributor collection from npm package root
     * as well as all versioned packages.
     */
    extractContributors(info) {
        let contributors = _(info.versions)
            .keys()
            .sortBy() // ensure versions are sorted
            .map(v => {
                return [info.versions[v].author]
                    .concat(info.versions[v].maintainers || []);
            })
            .flatten()
            .concat(info.author, info.maintainers || [])
            .value();

        // console.log('contributors before merge', JSON.stringify(contributors));

        contributors = mergedContributors(contributors);
        // console.log('contributors after merge', JSON.stringify(contributors));

        return contributors;
    }

    async get(packageName) {
        const [info, downloads] = await Promise.all([
            this.npmApi.info(packageName),
            this.npmApi.downloads(packageName, NpmApi.TIME_POINT_LAST_MONTH)
        ]);

        const lastVersion = _.last(_.keys(info.versions || {}));
        const deps = (info.versions && info.versions[lastVersion].dependencies && _.keys(info.versions[lastVersion].dependencies)) || [];
        const contributors = this.extractContributors(info);

        return {
            name: info.name,
            description: info.description,
            created: info.time && info.time.created,
            modified: info.time && info.time.modified,
            contributors,
            repository: typeof info.repository == 'string' ? info.repository : (info.repository && info.repository.url),
            dependencies: deps,
            downloads: (downloads && downloads.downloads) || 0
        };
    }
}
