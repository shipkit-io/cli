import * as p from '@clack/prompts';
import * as path from 'path';
import * as fs from 'fs-extra';
import { InstanceType, InstallOptions, Instance } from '../types';
import {
    addInstance,
    cloneRepository,
    generateUniqueName
} from '../utils';
import { REPOSITORIES } from '../config';

// Repository URLs
const REPOS = {
    [InstanceType.SHIPKIT]: REPOSITORIES.SHIPKIT,
    [InstanceType.BONES]: REPOSITORIES.BONES,
};

/**
 * Install command implementation
 */
export async function install(type: string, options: InstallOptions) {
    const s = p.spinner();

    try {
        // Validate instance type
        if (type !== InstanceType.SHIPKIT && type !== InstanceType.BONES) {
            p.cancel(`Invalid instance type: ${type}. Must be "shipkit" or "bones".`);
            return;
        }

        const instanceType = type as InstanceType;

        // If options are provided, use them directly
        let name = options.name;
        let directory = options.directory;
        let confirmInstall = true;

        // If options are not provided, prompt for them
        if (!name || !directory) {
            const namePrompt = !name ? await p.text({
                message: 'Give this instance a name:',
                placeholder: generateUniqueName(instanceType),
                validate: (value) => {
                    if (!value.trim()) return 'Name is required';
                    if (value.includes(' ')) return 'Name cannot contain spaces';
                    return;
                }
            }) : null;

            if (p.isCancel(namePrompt)) {
                p.cancel('Installation cancelled.');
                return;
            }

            if (namePrompt) name = namePrompt;

            const directoryPrompt = !directory ? await p.text({
                message: 'Installation directory:',
                placeholder: path.join(process.cwd(), instanceType),
                validate: (value) => {
                    if (!value.trim()) return 'Directory is required';
                    return;
                }
            }) : null;

            if (p.isCancel(directoryPrompt)) {
                p.cancel('Installation cancelled.');
                return;
            }

            if (directoryPrompt) directory = directoryPrompt;

            // Confirm installation
            const confirm = await p.confirm({
                message: `Install ${instanceType} as "${name}" to ${directory}?`,
                initialValue: true,
            });

            if (p.isCancel(confirm)) {
                p.cancel('Installation cancelled.');
                return;
            }

            confirmInstall = confirm;
        }

        if (!name) name = generateUniqueName(instanceType);
        if (!directory) directory = path.join(process.cwd(), instanceType);

        if (!confirmInstall) {
            p.cancel('Installation cancelled.');
            return;
        }

        // Ensure the directory doesn't exist or is empty
        if (await fs.pathExists(directory)) {
            const dirContents = await fs.readdir(directory);
            if (dirContents.length > 0) {
                const shouldContinue = await p.confirm({
                    message: `Directory ${directory} is not empty. Continue anyway?`,
                    initialValue: false,
                });

                if (p.isCancel(shouldContinue) || !shouldContinue) {
                    p.cancel('Installation cancelled.');
                    return;
                }
            }
        } else {
            await fs.ensureDir(directory);
        }

        // Start the installation
        s.start(`Installing ${instanceType}...`);

        // Clone the repository
        await cloneRepository({
            repository: REPOS[instanceType],
            directory
        });

        // Install dependencies if package.json exists
        const packageJsonPath = path.join(directory, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
            s.message('Installing dependencies...');
            const currentDir = process.cwd();
            process.chdir(directory);

            // Use npm or yarn based on what's available
            try {
                // Check for yarn.lock first
                if (await fs.pathExists(path.join(directory, 'yarn.lock'))) {
                    require('child_process').execSync('yarn install', { stdio: 'ignore' });
                } else {
                    require('child_process').execSync('npm install', { stdio: 'ignore' });
                }
            } catch (error) {
                console.error('Error installing dependencies:', error);
            }

            process.chdir(currentDir);
        }

        // Register the instance
        const instance: Instance = {
            name,
            type: instanceType,
            path: path.resolve(directory),
            version: '0.1.0', // Default version, to be updated later
            installedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await addInstance(instance);

        s.stop(`${instanceType} installed successfully!`);

        p.note(`
      Installation complete!

      Type: ${instanceType}
      Name: ${name}
      Location: ${path.resolve(directory)}

      To manage this instance, use:
      - shipkit update ${name}
      - shipkit remove ${name}
    `, 'Success!');

    } catch (error) {
        s.stop(`Installation failed: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
}
