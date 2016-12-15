/* eslint no-console: off */
import program from "commander";
import chalk from "chalk";
import { NpmPackageTransformer } from "./NpmPackageTransformer";
import _ from "lodash";
import { v1 as neo4j } from "neo4j-driver";
import { NpmDataProvider } from "../api/data/NpmDataProvider";
import { NpmApi } from "../api/data/NpmApi";

const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "neo4j"));

const importNpm = program
    .command('npm-package <pkg> [...otherPkg]')
    .description('Import package and dependency tree into local graph database')
    .option('--verbose', 'Display additional intermediate information')
    .option('--recursive', 'Import dependencies when found recursively')
    .option('--silent', 'Nothing sent to standard output (error output still available)')
    .action(async (pkg, otherPkg) => {
        console.log(chalk.yellow('Import package:'), pkg);

        const api = new NpmApi();
        const provider = new NpmDataProvider(api);
        const transformer = new NpmPackageTransformer(provider, driver);

        const packages = _(pkg).concat(otherPkg).compact().value();

        try {
            for (let i = 0; i < packages.length; i++) {
                let p = packages[i];
                await transformer.importPackage(p, _.pick(importNpm, ['verbose', 'recursive', 'silent']));
            }
        } catch (ex) {
            console.error('Failed to import', ex);
            process.exit(1);
        }

        console.log(chalk.yellow('Import completed.'));
        process.exit(0);
    });

program.parse(process.argv);
