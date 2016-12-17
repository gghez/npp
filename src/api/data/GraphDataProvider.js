import _ from "lodash";

export class GraphDataProvider {
    constructor(driver) {
        this.driver = driver;
    }

    async get(packageName) {
        if (typeof packageName != 'string' || packageName.trim() == '') {
            throw new Error('Invalid package name provided.');
        }

        const cypher = `
MATCH (p:Package {name:{packageName}})-[:DEPENDS_ON]->(d:Package)
WITH p, collect(d.name) as dependencies
MATCH (c:Person)-[:CONTRIBUTES_ON]->(p)
RETURN p, dependencies, collect(c.name) as contributors`;

        let session, result;
        try {
            session = this.driver.session()
            result = await session.run(cypher, { packageName });
        } finally {
            session.close();
        }

        const record = result && result.records && result.records[0];

        const pIndex = record.keys.indexOf('p');
        const depIndex = record.keys.indexOf('dependencies');
        const contribIndex = record.keys.indexOf('contributors');

        return _.assign(
            record._fields[pIndex].properties,
            { dependencies: record._fields[depIndex] },
            { contributors: record._fields[contribIndex] }
        );
    }

    async search(terms) {
        if (typeof terms != 'string' || terms.trim() == '') {
            throw new Error('Invalid terms provided.');
        }

        const cypher = `
MATCH (p:Package)-[:DEPENDS_ON]->(d:Package)
WHERE p.name CONTAINS {terms}
WITH p, collect(d.name) as dependencies
MATCH (c:Person)-[:CONTRIBUTES_ON]->(p)
RETURN p, dependencies, collect(c.name) as contributors`;

        let session, result;
        try {
            session = this.driver.session()
            result = await session.run(cypher, { terms });
        } finally {
            session.close();
        }

        return result.records.map(record => {
            const pIndex = record.keys.indexOf('p');
            const depIndex = record.keys.indexOf('dependencies');
            const contribIndex = record.keys.indexOf('contributors');

            return _.assign(
                record._fields[pIndex].properties,
                { dependencies: record._fields[depIndex] },
                { contributors: record._fields[contribIndex] }
            );
        });
    }
}
