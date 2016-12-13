import program from "commander";
import chalk from "chalk";
import { importPackage } from "./import";

program
    .command('import-tree <pkg> [otherPkgs...]')
    .description('Import package and dependency tree into local graph database')
    .action(async (pkg, otherPkgs) => {
        let pkgList = [pkg];
        if (Array.isArray(otherPkgs)) {
            pkgList = pkgList.concat(otherPkgs);
        }

        console.log(chalk.yellow('Import packages:'), pkgList.join(', '));

        await Promise.all(pkgList.map(importPackage));
        console.log('Import completed.');
    });

program.parse(process.argv);
console.log('end.');
