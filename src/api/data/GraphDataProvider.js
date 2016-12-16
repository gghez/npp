export class GraphDataProvider {
    constructor(driver) {
        this.driver = driver;
    }

    async get(packageName) {
        if (typeof packageName != 'string' || packageName.trim() == '') {
            throw new Error('Invalid package name provided.');
        }

        const cypher = `MATCH (p:Package {name:'babel'})
MATCH (p)-[:DEPENDS_ON]->(d:Package)
MATCH (c:Person)-[:CONTRIBUTES_ON]->(p)
RETURN p, collect(d.name) AS dependencies, collect(c) AS contributors`;

        let session, result;
        try {
            session = this.driver.session()
            result = await session.run(cypher, { packageName });
        } finally {
            session.close();
        }

        return result &&
            result.records &&
            result.records[0] &&
            result.records[0]._fields &&
            result.records[0]._fields[0] &&
            result.records[0]._fields[0].properties;
    }
}
