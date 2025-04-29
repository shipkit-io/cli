import * as p from '@clack/prompts';
import * as fs from 'fs-extra';
import { getAllInstances } from '../utils';
import { Instance } from '../types';

/**
 * Format a date string to a more readable format
 */
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
}

/**
 * List command implementation
 */
export async function list() {
    const s = p.spinner();

    try {
        s.start('Fetching instances...');

        const instances = await getAllInstances();

        s.stop('Instances fetched successfully!');

        if (instances.length === 0) {
            p.note('No instances found. Use "shipkit install" to add an instance.', 'No instances');
            return;
        }

        // Verify instances exist on disk
        const verifiedInstances: Instance[] = [];
        const missingInstances: Instance[] = [];

        for (const instance of instances) {
            if (await fs.pathExists(instance.path)) {
                verifiedInstances.push(instance);
            } else {
                missingInstances.push(instance);
            }
        }

        // Display verified instances
        if (verifiedInstances.length > 0) {
            const instancesTable = verifiedInstances.map(instance => ({
                name: instance.name,
                type: instance.type,
                path: instance.path,
                installed: formatDate(instance.installedAt),
                updated: formatDate(instance.updatedAt)
            }));

            console.table(instancesTable);
        }

        // Display warning for missing instances
        if (missingInstances.length > 0) {
            const missingInstancesList = missingInstances.map(instance =>
                `- ${instance.name} (${instance.type}) at ${instance.path}`
            ).join('\n');

            p.note(`
        The following instances are registered but their directories could not be found:
        ${missingInstancesList}

        You can remove these with "shipkit remove <name>"
      `, 'Warning: Missing Instances');
        }

    } catch (error) {
        s.stop(`Failed to list instances: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
}
