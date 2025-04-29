import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import { homedir } from 'os';
import * as axios from 'axios';
import { Instance, InstanceType, ShipkitConfig, GitOptions } from './types';

// Config file path in user's home directory
const CONFIG_PATH = path.join(homedir(), '.shipkit-cli', 'config.json');

/**
 * Get the configuration file, create it if it doesn't exist
 */
export async function getConfig(): Promise<ShipkitConfig> {
    try {
        await fs.ensureDir(path.dirname(CONFIG_PATH));

        if (!await fs.pathExists(CONFIG_PATH)) {
            const defaultConfig: ShipkitConfig = {
                instances: [],
                lastUpdated: new Date().toISOString()
            };
            await fs.writeJson(CONFIG_PATH, defaultConfig, { spaces: 2 });
            return defaultConfig;
        }

        return await fs.readJson(CONFIG_PATH);
    } catch (error) {
        console.error('Error accessing configuration file:', error);
        throw new Error('Failed to access configuration file');
    }
}

/**
 * Save the configuration file
 */
export async function saveConfig(config: ShipkitConfig): Promise<void> {
    try {
        await fs.ensureDir(path.dirname(CONFIG_PATH));
        config.lastUpdated = new Date().toISOString();
        await fs.writeJson(CONFIG_PATH, config, { spaces: 2 });
    } catch (error) {
        console.error('Error saving configuration file:', error);
        throw new Error('Failed to save configuration file');
    }
}

/**
 * Add an instance to the configuration
 */
export async function addInstance(instance: Instance): Promise<void> {
    const config = await getConfig();
    config.instances.push(instance);
    await saveConfig(config);
}

/**
 * Remove an instance from the configuration
 */
export async function removeInstance(name: string): Promise<boolean> {
    const config = await getConfig();
    const initialLength = config.instances.length;
    config.instances = config.instances.filter(instance => instance.name !== name);

    if (config.instances.length === initialLength) {
        return false;
    }

    await saveConfig(config);
    return true;
}

/**
 * Find an instance by name
 */
export async function findInstance(name: string): Promise<Instance | undefined> {
    const config = await getConfig();
    return config.instances.find(instance => instance.name === name);
}

/**
 * Get all instances
 */
export async function getAllInstances(): Promise<Instance[]> {
    const config = await getConfig();
    return config.instances;
}

/**
 * Update an instance in the configuration
 */
export async function updateInstance(name: string, updates: Partial<Instance>): Promise<boolean> {
    const config = await getConfig();
    const instanceIndex = config.instances.findIndex(instance => instance.name === name);

    if (instanceIndex === -1) {
        return false;
    }

    config.instances[instanceIndex] = {
        ...config.instances[instanceIndex],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    await saveConfig(config);
    return true;
}

/**
 * Clone a git repository
 */
export async function cloneRepository(options: GitOptions): Promise<string> {
    try {
        const { repository, branch = 'main', directory } = options;

        let cloneUrl = repository;
        if (options.credentials) {
            const { username, token } = options.credentials;
            // Format: https://username:token@github.com/username/repo.git
            const parsedUrl = new URL(repository);
            cloneUrl = `${parsedUrl.protocol}//${username}:${token}@${parsedUrl.host}${parsedUrl.pathname}`;
        }

        const targetDir = directory || path.basename(repository, '.git');

        // Check if directory exists
        if (await fs.pathExists(targetDir)) {
            throw new Error(`Directory ${targetDir} already exists`);
        }

        // Clone the repository
        const command = `git clone ${cloneUrl} ${targetDir} --branch ${branch} --single-branch`;
        execSync(command, { stdio: 'pipe' });

        return path.resolve(targetDir);
    } catch (error) {
        console.error('Error cloning repository:', error);
        throw new Error('Failed to clone repository');
    }
}

/**
 * Get repository information
 */
export async function getRepositoryInfo(repoUrl: string): Promise<any> {
    try {
        // Extract owner and repo from GitHub URL
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
        if (!match) {
            throw new Error('Invalid GitHub repository URL');
        }

        const [, owner, repo] = match;
        const response = await axios.default.get(`https://api.github.com/repos/${owner}/${repo}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching repository information:', error);
        throw new Error('Failed to fetch repository information');
    }
}

/**
 * Generate a unique name for an instance
 */
export function generateUniqueName(type: InstanceType): string {
    return `${type}-${Date.now().toString(36)}`;
}
