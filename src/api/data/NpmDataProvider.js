import { NpmApi } from "./NpmApi";
import _ from "lodash";
import {getPeopleInfo} from "../helper/peopleHelper";

export class NpmDataProvider {
    constructor(npmApi) {
        this.npmApi = npmApi;
    }

    get(packageName) {
        return Promise.all([
            this.npmApi.info(packageName),
            this.npmApi.downloads(packageName, NpmApi.TIME_POINT_LAST_MONTH)
        ]).then(([info, downloads]) => {
            const lastVersion = _.last(Object.keys(info.versions || {}));
            const deps = info.versions && info.versions[lastVersion].dependencies && Object.keys(info.versions[lastVersion].dependencies);
            return {
                name: info.name,
                description: info.description,
                created: info.time && info.time.created,
                modified: info.time && info.time.modified,
                author: getPeopleInfo(info.author),
                maintainers: info.maintainers && info.maintainers.map(getPeopleInfo),
                repository: typeof info.repository == 'string' ? info.repository : (info.repository && info.repository.url),
                dependencies: deps,
                downloads: downloads.downloads
            };
        });
    }
}
