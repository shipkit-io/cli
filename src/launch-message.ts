import { CLI_NAME } from './config';

/**
 * Simple color functions using ANSI escape codes
 * These are defined inline to avoid import issues during CLI execution
 */
const colors = {
    reset: (text: string) => `\x1b[0m${text}\x1b[0m`,
    bold: (text: string) => `\x1b[1m${text}\x1b[22m`,
    dim: (text: string) => `\x1b[2m${text}\x1b[22m`,
    cyan: (text: string) => `\x1b[36m${text}\x1b[39m`,
    blue: (text: string) => `\x1b[34m${text}\x1b[39m`,
    green: (text: string) => `\x1b[32m${text}\x1b[39m`,
    magenta: (text: string) => `\x1b[35m${text}\x1b[39m`,
    yellow: (text: string) => `\x1b[33m${text}\x1b[39m`,
};

/**
 * Helper function to create a smooth gradient
 * @param text The text to apply the gradient to
 * @returns The text with a smooth gradient applied
 */
function createGradient(text: string): string {
    // Split the text into characters
    const chars = text.split("");
    const totalChars = chars.length;

    // Use true color (24-bit RGB) for the smoothest possible gradient
    // This provides a perfectly smooth transition with no harsh color changes
    // Define start and end colors in RGB
    const startColor = { r: 0, g: 255, b: 255 }; // cyan
    const endColor = { r: 255, g: 105, b: 180 }; // hot pink

    let result = "";
    for (let i = 0; i < totalChars; i++) {
        const ratio = i / (totalChars - 1);

        // Linear interpolation between colors
        const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
        const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
        const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));

        // Use true color escape sequence for perfectly smooth gradient
        result += `\x1b[38;2;${r};${g};${b}m${chars[i]}\x1b[39m`;
    }

    return result;
}

/**
 * ASCII art for ShipKit logo with a smooth left-to-right gradient
 */
const shipArt = `
${createGradient("   ███████╗██╗  ██╗██╗██████╗ ██╗  ██╗██╗████████╗")}
${createGradient("   ██╔════╝██║  ██║██║██╔══██╗██║ ██╔╝██║╚══██╔══╝")}
${createGradient("   ███████╗███████║██║██████╔╝█████╔╝ ██║   ██║   ")}
${createGradient("   ╚════██║██╔══██║██║██╔═══╝ ██╔═██╗ ██║   ██║   ")}
${createGradient("   ███████║██║  ██║██║██║     ██║  ██╗██║   ██║   ")}
${createGradient("   ╚══════╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝  ╚═╝╚═╝   ╚═╝   ")}
`;

// Track if the message has been displayed in this session
// Use a module-level variable that persists across imports
let hasDisplayedMessage = false;

/**
 * Display a colorful launch message in the console
 *
 * This function prints a fun, colorful ASCII art logo and launch message
 * for ShipKit, making the startup experience more engaging.
 *
 * The message will only be displayed once per process.
 */
export function displayLaunchMessage(): void {
    // Only display once per process
    if (hasDisplayedMessage) {
        return;
    }

    // Mark as displayed
    hasDisplayedMessage = true;

    // Print the ASCII art logo
    console.info(shipArt);

    // Print a divider
    console.info(`${colors.dim("=".repeat(50))}`);

    // Display CLI info
    console.info(
        `${colors.dim("=".repeat(12))}  ${colors.green(`${colors.bold(CLI_NAME)}`)} ➜ ${colors.dim("=".repeat(12))}`
    );

    // Display deployment info
    console.info(
        `${colors.dim("= ")}${colors.cyan("Deploy Shipkit to Vercel with a single command")}${colors.dim(" =")}`
    );
}

// Export the ASCII art and colors for use in other files
export { shipArt, colors };
