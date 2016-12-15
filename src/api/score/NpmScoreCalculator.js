import _ from "lodash";
import { daysSince } from "../helper/dateHelper";

export class NpmScoreCalculator {
    static DOWNLOADS_WEIGHT = 4;
    static PEOPLE_WEIGHT = 3;
    static ACTIVITY_WEIGHT = 2;
    static BIRTH_WEIGHT = 1;

    getScoreData(pkg) {
        return {
            birthDate: pkg.created,
            lastActivity: pkg.modified,
            people: pkg.contributors.length,
            downloads: pkg.downloads
        }
    }

    /**
     * Scores a package among similar other packages.
     * @param pkg Package to score
     * @param otherSimilarPackages A collection of similar package
     */
    score(pkg, otherSimilarPackages) { // todo: use date for scoring at date instead of now
        const pkgData = this.getScoreData(pkg);
        const allData = otherSimilarPackages.concat([pkg]).map(this.getScoreData);

        const maxDownloads = _.max(allData.map(d => d.downloads));
        const maxPeople = _.max(allData.map(d => d.people));

        const activityMinDelta = _.min(allData.map(d => daysSince(new Date(d.lastActivity))));
        const pkgActivityDelta = daysSince(new Date(pkgData.lastActivity));

        const birthMinDelta = _.min(allData.map(d => daysSince(new Date(d.birthDate))));
        const pkgBirthDelta = daysSince(new Date(pkgData.birthDate));

        const realScore = NpmScoreCalculator.DOWNLOADS_WEIGHT * (pkgData.downloads / maxDownloads) +
            NpmScoreCalculator.PEOPLE_WEIGHT * (pkgData.people / maxPeople) +
            NpmScoreCalculator.ACTIVITY_WEIGHT * (activityMinDelta / pkgActivityDelta) +
            NpmScoreCalculator.BIRTH_WEIGHT * (birthMinDelta / pkgBirthDelta);

        return _.round(realScore, 1);
    }
}
