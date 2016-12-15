import _ from "lodash";

export function daysBetween(d1, d2) {
    return (d1 - d2) / 86400000;
}

export function daysSince(pastDate) {
    return daysBetween(_.now(), pastDate);
}
