import { NpmApi } from "./NpmApi";
import _ from "lodash";
import { getPeopleInfo } from "../helper/peopleHelper";

export class NpmDataProvider {
    constructor(npmApi) {
        this.npmApi = npmApi;
    }

    extractContributors(node) {
        let contributors = [getPeopleInfo(node.author)];
        if (Array.isArray(node.maintainers)) {
            contributors = contributors.concat(node.maintainers.map(getPeopleInfo));
        }

        if (node.versions) {
            _(node.versions).keys().each(v => {
                const vContributors = this.extractContributors(node.versions[v]);
                contributors = contributors.concat(vContributors);
            });
        }

        contributors = _(contributors)
            .filter(_.identity)
            .uniqWith((c1, c2) => (c1.name == c2.name && c1.name) || (c1.email == c2.email && c1.email))
            .value();

        return contributors;
    }

    get(packageName) {
        return Promise.all([
            this.npmApi.info(packageName),
            this.npmApi.downloads(packageName, NpmApi.TIME_POINT_LAST_MONTH)
        ]).then(([info, downloads]) => {
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
        });
    }
}
