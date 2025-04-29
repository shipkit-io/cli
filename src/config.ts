/**
 * Configuration values for the ShipKit CLI
 */

// Base name for the CLI tool
export const CLI_NAME = 'ShipKit CLI';

// Version of the CLI (imported from package.json in other files)

// Default repository URLs
export const REPOSITORIES = {
    SHIPKIT: 'https://github.com/shipkit/shipkit.git',
    BONES: 'https://github.com/bones-sh/bones.sh.git',
};

// Vercel deployment URL for Shipkit
export const VERCEL_DEPLOY_URL = 'https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshipkit-io%2Fbones&project-name=bones-app&repository-name=bones-app&redirect-url=https%3A%2F%2Fshipkit.io%2Fconnect%2Fvercel%2Fdeploy&developer-id=oac_KkY2TcPxIWTDtL46WGqwZ4BF&production-deploy-hook=Shipkit+Deploy&demo-title=Shipkit+Preview&demo-description=The+official+Shipkit+Preview.+A+full+featured+demo+with+dashboards%2C+AI+tools%2C+and+integrations+with+Docs%2C+Payload%2C+and+Builder.io&demo-url=https%3A%2F%2Fshipkit.io%2Fdemo&demo-image=%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F4JmubmYDJnFtstwHbaZPev%2F0c3576832aae5b1a4d98c8c9f98863c3%2FVercel_Home_OG.png&teamSlug=lacymorrows-projects';

// Configuration file path (constructed in utils.ts)
