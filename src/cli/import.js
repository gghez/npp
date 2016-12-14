/* eslint no-console: off */
import { NpmDataProvider } from "../api/data/NpmDataProvider";
import { NpmApi } from "../api/data/NpmApi";
import chalk from "chalk";
import _ from "lodash"

import { v1 as neo4j } from "neo4j-driver";

const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "neo4j"));

export async function importPackage(packageName, options, depth = 0) {
    const api = new NpmApi();
    const provider = new NpmDataProvider(api);
    const pkg = await provider.get(packageName);

    console.log('[' + _.padEnd(depth, 2) + ']', packageName, '<--', chalk.blue('NPM'), );

    if (options.verbose) {
        console.log(chalk.gray(JSON.stringify(pkg)));
    }

    const depRelations = pkg.dependencies.map(dep => `MERGE (p)-[:DEPENDS_ON]->(:Package {name:"${dep}"})`).join('\n');
    const maintainerRelations = pkg.maintainers.map((m, i) => `MERGE (m${i}:Person {name:"${m.name}"})-[:CONTRIBUTES_ON]->(p)`).join('\n');
    const maintainerEmails = pkg.maintainers.map((m, i) => m.email ? `m${i}.email = "${m.email}",` : '').join('\n    ');

    const cypherRequest = `
MERGE (a:Person {name:{authorName}})-[:AUTHOR_OF]->(p:Package {name:{packageName}})
${depRelations}
${maintainerRelations}
SET p.description = {description},
    p.created = {created},
    p.modified = {modified},
    p.repository = {repository},
    p.downloads = {downloads},
    ${maintainerEmails}
    a.email = {authorEmail}
RETURN p`;

    if (options.verbose) {
        console.log('CYPHER');
        console.log(chalk.gray(cypherRequest));
    }

    let result, session;
    try {
        session = driver.session();
        result = await session.run(cypherRequest, {
            authorName: pkg.author.name,
            authorEmail: pkg.author.email || null,
            packageName,
            description: pkg.description,
            created: pkg.created,
            modified: pkg.modified,
            repository: pkg.repository,
            downloads: pkg.downloads
        });
    } finally {
        session.close();
    }

    console.log('[' + _.padEnd(depth, 2) + ']', packageName, '-->', chalk.blue('Neo4j'));

    if (options.verbose) {
        console.log(chalk.gray(JSON.stringify(result.records)));
    }

    if (options.recursive) {
        await Promise.all(pkg.dependencies.map(d => importPackage(d, options, depth + 1)));
    }

    return result.records;
}
