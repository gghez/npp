import _ from "lodash";

export class NpmPricer {

    getPricingData(pkg) {
        let contributors = [];
        if (pkg.author) {
            contributors.push(typeof pkg.author == 'string' ? { name: pkg.author } : pkg.author);
        }

        if (Array.isArray(pkg.maintainers)) {
            contributors = contributors.concat(pkg.maintainers);
        }

        contributors = _.uniqBy(contributors, 'name');
        contributors = _.uniqBy(contributors, 'email');

        return {
            lastActivity: pkg.modified,
            people: contributors.length,
            downloads: pkg.downloads
        }
    }

    price(pkg) {
        const data = this.getPricingData(pkg);

        return data.activity + data.people + data.downloads;
    }
}
