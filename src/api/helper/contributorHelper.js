import _ from "lodash";

export function normalizeContributor(value) {
    if (!value) {
        return value;
    }

    if (typeof value == 'string') {
        // https://regex101.com/r/CZtKRc/2
        // todo: may be improved to avoid .trim()
        const m = /([^<(]+)?(<(.+?)>)?\s*(\((.+?)\))?/.exec(value);
        if (m) {
            return {
                name: m[1] && m[1].trim(),
                email: m[3] && m[3].trim(),
                url: m[5] && m[5].trim()
            };
        } else {
            return {
                name: value.trim()
            };
        }
    }

    return value;
}

/**
 * Checks whether two contributors are equals.
 * They are if name or email fields are equal and not falsy.
 */
export function contributorEquals(_c1, _c2) {
    if (_.isEmpty(_c1) && _.isEmpty(_c2)) {
        return true;
    } else if ((_.isEmpty(_c1) && !_.isEmpty(_c2)) || (!_.isEmpty(_c1) && _.isEmpty(_c2))) {
        return false;
    }

    const c1 = normalizeContributor(_c1), c2 = normalizeContributor(_c2);

    return (c1.name == c2.name && c1.name) || (c1.email == c2.email && c1.email);
}

/**
 * Returns a list of unique contributors. Contributors are normalized.
 */
export function mergedContributors(_contributors) {
    const contributors = _contributors.slice().map(normalizeContributor);
    const merged = [];

    while (contributors.length) {
        // console.log('contributors', JSON.stringify(contributors));
        // console.log('merged', JSON.stringify(merged));
        const current = _.first(contributors);
        const similarContributors = _.remove(contributors, c => contributorEquals(c, current));

        if (!_.isEmpty(current)) {
            const contributor = similarContributors.reduce((result, c) => {
                result.name = c.name || result.name;
                result.email = c.email || result.email;
                result.url = c.url || result.url;

                return result;
            }, {});

            if (similarContributors.length > 1) {
                contributors.unshift(contributor);
            } else { // == 1
                merged.push(contributor);
            }
        }
    }

    return merged;
}