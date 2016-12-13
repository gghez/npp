import _ from "lodash";
import { daysBetween } from "../helper/dateHelper";

export class NpmScoreCalculator {
    static DOWNLOADS_WEIGHT = 4;
    static PEOPLE_WEIGHT = 3;
    static ACTIVITY_WEIGHT = 2;
    static BIRTH_WEIGHT = 1;

    getScoreData(pkg) {
        let contributors = [];
        if (pkg.author) {
            contributors.push(typeof pkg.author == 'string' ? { name: pkg.author } : pkg.author);
        }

        if (Array.isArray(pkg.maintainers)) {
            contributors = contributors.concat(pkg.maintainers);
        }

        contributors = _.uniqWith(contributors, (c1, c2) => c1.name == c2.name || c1.email == c2.email);

        return {
            birthDate: pkg.created,
            lastActivity: pkg.modified,
            people: contributors.length,
            downloads: pkg.downloads
        }
    }

    /**
     * Scores a package among similar other packages.
     * @param pkg Package to score
     * @param otherSimilarPackages A collection of similar package
     */
    score(pkg, otherSimilarPackages) {
        const pkgData = this.getScoreData(pkg);
        const allData = otherSimilarPackages.concat([pkg]).map(this.getScoreData);

        const maxDownloads = _.max(allData.map(d => d.downloads));
        const maxPeople = _.max(allData.map(d => d.people));

        const now = new Date();

        const activityMinDelta = _.min(allData.map(d => daysBetween(now, new Date(d.lastActivity))));
        const pkgActivityDelta = daysBetween(now, new Date(pkgData.lastActivity));

        const birthMinDelta = _.min(allData.map(d => daysBetween(now, new Date(d.birthDate))));
        const pkgBirthDelta = daysBetween(now, new Date(pkgData.birthDate));

        const realScore = NpmScoreCalculator.DOWNLOADS_WEIGHT * (pkgData.downloads / maxDownloads) +
            NpmScoreCalculator.PEOPLE_WEIGHT * (pkgData.people / maxPeople) +
            NpmScoreCalculator.ACTIVITY_WEIGHT * (activityMinDelta / pkgActivityDelta) +
            NpmScoreCalculator.BIRTH_WEIGHT * (birthMinDelta / pkgBirthDelta);

        return Math.floor(realScore);
    }
}
