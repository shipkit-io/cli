import open from 'open';
import * as p from '@clack/prompts';
import { VERCEL_DEPLOY_URL } from '../config';

export async function deploy(): Promise<void> {
    try {
        const spinner = p.spinner();
        spinner.start('Opening Shipkit deployment page in your browser');

        // Open the Vercel deployment URL in the default browser
        await open(VERCEL_DEPLOY_URL);

        spinner.stop('Shipkit deployment page opened in your browser');

        // Show a confirmation message
        p.note('Deploying Shipkit to Vercel', 'Follow the instructions in your browser to complete the deployment');

    } catch (error) {
        p.cancel('Failed to open deployment page');
        console.error('Error opening browser:', error);
        throw error;
    }
}
