import { NpmDataProvider } from "../api/data/NpmDataProvider";
import { NpmApi } from "../api/data/NpmApi";
import chalk from "chalk";

import { v1 as neo4j } from "neo4j-driver";

const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "neo4j"));

export async function importPackage(packageName) {
    const api = new NpmApi();
    const provider = new NpmDataProvider(api);
    const pkg = await provider.get(packageName);

    console.log(packageName, '<--', chalk.blue('NPM'), );
    console.log(chalk.gray(JSON.stringify(pkg)));

    const session = driver.session();

    const cypherRequest = `
        MERGE (a:Person {name:{authorName}})-[:AUTHOR_OF]->(p:Package {name:{packageName}})
        SET p.description = {description},
            p.created = {created},
            p.modified = {modified},
            p.repository = {repository},
            p.downloads = {downloads},
            a.email = {authorEmail}
        RETURN p`;

    let result;
    try {
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
    } catch (neoEx) {
        console.error('NEOEX', neoEx);
    } finally {
        session.close();
    }

    console.log(packageName, '-->', chalk.blue('Neo4j'));
    console.log(chalk.gray(JSON.stringify(result.records)));

    return result.records;
}
