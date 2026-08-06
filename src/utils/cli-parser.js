import { parseArgs } from 'node:util';

/**
 * Parses CLI arguments for a command starting after the command name.
 * @param {string[]} args - Full CLI arguments array (where args[0] is the command name)
 * @param {Object} optionsConfig - Options configuration for util.parseArgs
 * @returns {{ values: Object, positionals: string[] }}
 */
export function parseCommandArgs(args, optionsConfig = {}) {
    // Exclude command name (args[0]) if present
    const commandArgs = args.length > 0 && !args[0].startsWith('-') && !args[0].includes('=')
        ? args.slice(1)
        : args;

    try {
        const parsed = parseArgs({
            args: commandArgs,
            options: optionsConfig,
            allowPositionals: true,
            strict: false
        });
        return {
            values: parsed.values || {},
            positionals: parsed.positionals || []
        };
    } catch {
        return {
            values: {},
            positionals: commandArgs.filter(arg => !arg.startsWith('-'))
        };
    }
}
