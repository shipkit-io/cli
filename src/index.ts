#!/usr/bin/env node

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { install } from './commands/install';
import { list } from './commands/list';
import { remove } from './commands/remove';
import { update } from './commands/update';
import { deploy } from './commands/deploy';
import { version } from '../package.json';
import { displayLaunchMessage } from './launch-message';

async function main() {
    // Display colorful launch message
    displayLaunchMessage();

    p.intro(''); // Add a small space after the launch message

    const program = new Command();

    program
        .name('shipkit')
        .description('CLI to manage shipkit.io and bones.sh instances')
        .version(version);

    // Make deploy the default command by adding it to the root program
    program
        .action(deploy)
        .description('Deploy Shipkit in your browser (default)');

    // Add the deploy command explicitly as well
    program
        .command('deploy')
        .description('Deploy Shipkit in your browser')
        .action(deploy);

    program
        .command('install')
        .description('Install a new instance')
        .argument('<type>', 'Type of instance to install (shipkit or bones)')
        .option('-d, --directory <directory>', 'Installation directory')
        .action(install);

    program
        .command('list')
        .description('List all managed instances')
        .action(list);

    const removeCommand = program
        .command('remove')
        .description('Remove an instance');

    removeCommand
        .argument('<n>', 'Name of the instance to remove')
        .action(remove);

    const updateCommand = program
        .command('update')
        .description('Update an instance');

    updateCommand
        .argument('<n>', 'Name of the instance to update')
        .action(update);

    try {
        await program.parseAsync(process.argv);
    } catch (error) {
        p.cancel('An error occurred');
        console.error(error);
        process.exit(1);
    }

    p.outro('Thanks for using ShipKit CLI!');
}

main().catch((error) => {
    p.cancel('An error occurred');
    console.error(error);
    process.exit(1);
});
