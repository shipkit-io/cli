import * as p from '@clack/prompts';
import * as fs from 'fs-extra';
import { execSync } from 'child_process';
import * as path from 'path';
import { findInstance, updateInstance } from '../utils';

/**
 * Update command implementation
 */
export async function update(name: string) {
    const s = p.spinner();

    try {
        s.start(`Looking for instance: ${name}...`);

        const instance = await findInstance(name);

        if (!instance) {
            s.stop(`Instance "${name}" not found.`);
            return;
        }

        s.stop(`Found ${instance.type} instance: ${name}`);

        // Check if the instance directory exists
        const directoryExists = await fs.pathExists(instance.path);

        if (!directoryExists) {
            p.note(`
        The directory for this instance does not exist at:
        ${instance.path}

        Please check if it has been moved or deleted.
      `, 'Error');
            return;
        }

        // Confirm update
        const confirmUpdate = await p.confirm({
            message: `Do you want to update the ${instance.type} instance "${name}"?`,
            initialValue: true,
        });

        if (p.isCancel(confirmUpdate) || !confirmUpdate) {
            p.cancel('Update cancelled.');
            return;
        }

        s.start(`Updating instance: ${name}...`);

        // Check if it's a git repository
        const gitDirExists = await fs.pathExists(path.join(instance.path, '.git'));

        if (!gitDirExists) {
            s.stop(`Cannot update instance: "${name}" is not a git repository.`);
            return;
        }

        // Perform the update (git pull)
        const currentDir = process.cwd();
        process.chdir(instance.path);

        try {
            // Stash any changes
            s.message('Stashing any local changes...');
            execSync('git stash', { stdio: 'ignore' });

            // Pull latest changes
            s.message('Pulling latest changes...');
            const gitOutput = execSync('git pull', { encoding: 'utf8' });

            // Update dependencies if needed
            if (await fs.pathExists(path.join(instance.path, 'package.json'))) {
                s.message('Updating dependencies...');

                // Check for yarn.lock first
                if (await fs.pathExists(path.join(instance.path, 'yarn.lock'))) {
                    execSync('yarn install', { stdio: 'ignore' });
                } else {
                    execSync('npm install', { stdio: 'ignore' });
                }
            }

            // Update instance info
            await updateInstance(name, {
                updatedAt: new Date().toISOString(),
            });

            s.stop(`Instance "${name}" successfully updated.`);

            p.note(`
        ${gitOutput}

        Instance "${name}" has been updated to the latest version.
      `, 'Update Complete');

        } catch (error) {
            s.stop(`Update failed: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        } finally {
            // Change back to the original directory
            process.chdir(currentDir);
        }

    } catch (error) {
        s.stop(`Failed to update instance: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
}
