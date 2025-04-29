import * as p from '@clack/prompts';
import * as fs from 'fs-extra';
import { findInstance, removeInstance } from '../utils';

/**
 * Remove command implementation
 */
export async function remove(name: string) {
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

        // Ask for confirmation
        const confirmRemove = await p.confirm({
            message: `Are you sure you want to remove the ${instance.type} instance "${name}"?`,
            initialValue: false,
        });

        if (p.isCancel(confirmRemove) || !confirmRemove) {
            p.cancel('Operation cancelled.');
            return;
        }

        // If directory exists, ask whether to delete files too
        let deleteFiles = false;
        if (directoryExists) {
            const deleteFilesPrompt = await p.confirm({
                message: `Do you also want to delete all files in ${instance.path}?`,
                initialValue: false,
            });

            if (!p.isCancel(deleteFilesPrompt)) {
                deleteFiles = deleteFilesPrompt;
            }
        }

        s.start(`Removing instance: ${name}...`);

        // Remove from config
        await removeInstance(name);

        // Remove files if requested
        if (deleteFiles) {
            s.message(`Deleting files in ${instance.path}...`);
            await fs.remove(instance.path);
        }

        s.stop(`Instance "${name}" successfully removed.`);

        p.note(
            deleteFiles
                ? `The instance "${name}" has been removed from tracking and all files have been deleted.`
                : `The instance "${name}" has been removed from tracking, but the files remain at:\n${instance.path}`,
            'Success!'
        );

    } catch (error) {
        s.stop(`Failed to remove instance: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
}
