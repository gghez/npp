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
        if (_(this.processedPackages).includes(packageName)) return;

        // save imported package to avoid re-run on same
        this.processedPackages.push(packageName);

        const options = _(_options).defaults({ verbose: false, recursive: false, silent: false }).value();

        const pkg = await this.npmDataProvider.get(packageName);
        if (!pkg) return;

        if (!options.silent) {
            console.log(`[${depth}] ${packageName} <-- ${chalk.blue('NPM')}`);
            if (options.verbose) {
                console.log(chalk.gray(JSON.stringify(pkg)));
            }
        }

        const dependencyRels = _(pkg.dependencies).map((dep,i) => `MERGE (d${i}:Package {name:"${dep}"}) MERGE (p)-[:DEPENDS_ON]->(d${i})`).value().join('\n');
        const contribRels = _(pkg.contributors).map((m, i) => `MERGE (m${i}:Person {name:"${m.name}"}) MERGE (m${i})-[:CONTRIBUTES_ON]->(p)`).value().join('\n');
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
    p.downloads = {downloads},
    p.keywords = {keywords}
RETURN p`;

        if (!options.silent && options.verbose) {
            console.log('CYPHER');
            console.log(chalk.gray(cypherRequest));
        }

        let result, session;
        try {
            session = this.neo4jDriver.session();
            const params = _(pkg)
                .pick([
                    'name',
                    'description',
                    'version',
                    'created',
                    'modified',
                    'repository',
                    'downloads',
                    'keywords'
                ])
                .assign({ keywords: (pkg.keywords || []).join(',') })
                .value();
            result = await session.run(cypherRequest, params);
        } finally {
            session.close();
        }

        if (!options.silent) {
            console.log(`[${depth}] ${packageName} --> ${chalk.blue('Neo4j')}`);
            if (options.verbose) {
                console.log(chalk.gray(JSON.stringify(result.records[0]._fields[0].properties)));
            }
        }

        if (options.recursive) {
            // avoid concurrent neo4j access
            const depPackages = pkg.dependencies || [];
            for (let i = 0; i < depPackages.length; i++) {
                await this.importPackage(depPackages[i], options, depth + 1);
            }
        }
    }

}
