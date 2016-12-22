import _ from "lodash";
import { daysBetween } from "../helper/dateHelper";

export class ScoreProvider {
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
     * @param scoreAt Time point at which scoring should occur.
     */
    score(pkg, otherSimilarPackages, scoreAt = _.now()) {
        const pkgData = this.getScoreData(pkg);
        const allData = _(pkg)
            .concat(otherSimilarPackages)
            .uniqBy('name')
            .map(this.getScoreData);

        const maxDownloads = allData.map(d => d.downloads).max();
        const maxPeople = allData.map(d => d.people).max();

        const activityMinDelta = allData.map(d => daysBetween(scoreAt, new Date(d.lastActivity))).min();
        const pkgActivityDelta = daysBetween(scoreAt, new Date(pkgData.lastActivity));
        console.log(pkg.name, activityMinDelta, pkgActivityDelta);

        const birthMinDelta = allData.map(d => daysBetween(scoreAt, new Date(d.birthDate))).min();
        const pkgBirthDelta = daysBetween(scoreAt, new Date(pkgData.birthDate));

        const realScore = ScoreProvider.DOWNLOADS_WEIGHT * (pkgData.downloads / maxDownloads) +
            ScoreProvider.PEOPLE_WEIGHT * (pkgData.people / maxPeople) +
            ScoreProvider.ACTIVITY_WEIGHT * (activityMinDelta / pkgActivityDelta) +
            ScoreProvider.BIRTH_WEIGHT * (birthMinDelta / pkgBirthDelta);

        return _.round(realScore, 1);
    }

    scoreAll(packages, scoreAt = _.now()) {
        return packages.map(p => {
            p.score = this.score(p, packages, scoreAt);
            return p;
        });
    }
}
