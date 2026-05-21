import util from 'util';

export function colorText(color, text) {
    return typeof util.styleText === 'function' ? util.styleText(color, text) : text;
}

export function showHelp() {
    console.log("Usage: env-creator <command> [options]");
    console.log("   or: env <command> [options]");
    console.log("Commands:");
    console.log("  c, create [KEY=value...]   Create a .env file (optionally with values)");
    console.log("  cfj, create-from-json <json> [--env <name>] Create .env or .env.<name> from JSON");
    console.log("  s, split --env <dev|prod>  Create environment-specific file from .env");
    console.log("  srt, sort [-g/--groups] [file] Sort keys alphabetically (default: .env). Use -g to sort inside existing groups.");
    console.log("  d, delete [file]           Delete an environment file (default: .env)");
    console.log("  gc, generate-constants [file] [--out <file>] Generate a JS file with env variable constants");
    console.log("Options:");
    console.log("  -h, --help              Show this help message");
}
