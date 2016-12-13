export function getPeopleInfo(people) {
    if (!people) {
        return people;
    }

    if (typeof people == 'string') {
        // https://regex101.com/r/CZtKRc/1
        const m = /(\w+)?\s*(<(.+?)>)?\s*(\((.+?)\))?/.exec(people);
        if (m) {
            return {
                name: m[1],
                email: m[3],
                url: m[5]
            };
        } else {
            return {
                name: people
            };
        }
    }

    return people;
}
