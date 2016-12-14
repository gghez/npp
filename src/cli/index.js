/* eslint no-console: off */
import program from "commander";
import chalk from "chalk";
import { importPackage } from "./import";
import _ from "lodash";

const importNpm = program
    .command('npm-package <pkg>')
    .description('Import package and dependency tree into local graph database')
    .option('--verbose', 'Display additional intermediate information')
    .option('--recursive', 'Import dependencies when found recursively')
    .action(async (pkg) => {
        console.log(chalk.yellow('Import package:'), pkg);

        try {
            await importPackage(pkg, _.pick(importNpm, ['verbose', 'recursive']));
        } catch (ex) {
            console.error('Failed to import', ex);
            process.exit(1);
        }

        console.log(chalk.yellow('Import completed.'));
        process.exit(0);
    });

program.parse(process.argv);
