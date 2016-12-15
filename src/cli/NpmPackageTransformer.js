/* eslint no-console: off */
import chalk from "chalk";
import _ from "lodash"

export class NpmPackageTransformer {
    processedPackages = [];

    constructor(npmDataProvider, neo4jDriver) {
        this.npmDataProvider = npmDataProvider;
        this.neo4jDriver = neo4jDriver;
    }

    async importPackage(packageName, _options, depth = 0) {
        const options = _(_options).defaults({ verbose: false, recursive: false, silent: false }).value();
        const pkg = await this.npmDataProvider.get(packageName);

        if (!options.silent) {
            console.log(`[${depth}] ${packageName} <-- ${chalk.blue('NPM')}`);
            if (options.verbose) {
                console.log(chalk.gray(JSON.stringify(pkg)));
            }
        }

        const dependencyRels = _(pkg.dependencies).map(dep => `MERGE (p)-[:DEPENDS_ON]->(:Package {name:"${dep}"})`).value().join('\n');
        const contribRels = _(pkg.contributors).map((m, i) => `MERGE (m${i}:Person {name:"${m.name}"})-[:CONTRIBUTES_ON]->(p)`).value().join('\n');
        const contribEmails = _(pkg.contributors).map((m, i) => m.email ? `m${i}.email = "${m.email}",` : '').value().join('\n    ');

        const cypherRequest = `
MERGE (p:Package {name:{name}})
${dependencyRels}
${contribRels}
SET ${contribEmails}
    p.description = {description},
    p.version = {version},
    p.created = {created},
    p.modified = {modified},
    p.repository = {repository},
    p.downloads = {downloads}
RETURN p`;

        if (!options.silent && options.verbose) {
            console.log('CYPHER');
            console.log(chalk.gray(cypherRequest));
        }

        let result, session;
        try {
            session = this.neo4jDriver.session();
            result = await session.run(cypherRequest, _.pick(pkg, [
                'name',
                'description',
                'version',
                'created',
                'modified',
                'repository',
                'downloads'
            ]));
        } finally {
            session.close();
        }

        const neoPackageData = result.records[0]._fields[0].properties;

        if (!options.silent) {
            console.log(`[${depth}] ${packageName} --> ${chalk.blue('Neo4j')}`);
            if (options.verbose) {
                console.log(chalk.gray(JSON.stringify(neoPackageData)));
            }
        }

        let insertedPackages = [neoPackageData];
        if (options.recursive) {
            // avoid concurrent neo4j access
            const depPackages = pkg.dependencies || [];
            for (let i = 0; i < depPackages; i++) {
                let d = depPackages[i];
                const idepPackages = await this.importPackage(d, options, depth + 1);
                insertedPackages = insertedPackages.concat(idepPackages);
            }
        }

        this.processedPackages = this.processedPackages.concat(insertedPackages.map(p => p.name));

        return insertedPackages;
    }

}