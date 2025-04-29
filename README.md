# ShipKit CLI

A command-line tool to deploy and manage shipkit.io instances. Built with [Clack](https://www.clack.cc/) for a beautiful CLI experience.

## Installation

```bash
npm install -g shipkit-cli
```

Or run directly with npx:

```bash
npx shipkit-cli
```

## Usage

```bash
# Deploy Shipkit to Vercel (default command)
shipkit

# Alternatively, use the explicit deploy command
shipkit deploy

# Show help
shipkit --help

# Install a new shipkit.io instance
shipkit install shipkit

# Install a new bones.sh instance
shipkit install bones

# List managed instances
shipkit list

# Remove an instance
shipkit remove <instance-name>

# Update an instance
shipkit update <instance-name>
```

## What it does

Running the CLI without any commands will open your browser to deploy Shipkit to Vercel. This allows you to quickly get started with a new Shipkit instance with just one command.

The deployment uses the [official Vercel deployment URL](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshipkit-io%2Fbones) which ensures you get the latest version of Shipkit with all pre-configured settings.

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/shipkit-cli.git
cd shipkit-cli

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode (watches for changes)
npm run dev
```

## License

MIT 
