export enum InstanceType {
    SHIPKIT = 'shipkit',
    BONES = 'bones',
}

export interface Instance {
    name: string;
    type: InstanceType;
    path: string;
    version: string;
    installedAt: string;
    updatedAt: string;
}

export interface ShipkitConfig {
    instances: Instance[];
    lastUpdated: string;
}

export interface GitOptions {
    repository: string;
    branch?: string;
    directory?: string;
    credentials?: {
        username: string;
        token: string;
    };
}

export interface InstallOptions {
    directory?: string;
    name?: string;
    version?: string;
}
