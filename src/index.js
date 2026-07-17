import { showHelp, colorText } from './help.js';
import { COLORS } from './constants.js';
import { create } from './commands/create.js';
import { createFromJson } from './commands/create-from-json.js';
import { split } from './commands/split.js';
import { sort } from './commands/sort.js';
import { delete as deleteCmd } from './commands/delete.js';
import { generateConstants } from './commands/generate-constants.js';

// get CLI arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    showHelp();
    process.exit(0);
}

const command = args[0];

if (command === '--help' || command === '-h' || command === 'help') {
    showHelp();
    process.exit(0);
}

switch (command) {
    // create an empty .env
    case 'c':
    case 'create': {
        create(args);
        break;
    }

    // create a .env from JSON
    case 'cfj':
    case 'create-from-json': {
        createFromJson(args);
        break;
    }

    // create .env.[name] with empty values
    case 's':
    case 'split': {
        split(args);
        break;
    }

    // sort keys in an env file alphabetically
    case 'srt':
    case 'sort': {
        sort(args);
        break;
    }

    // delete an environment file
    case 'd':
    case 'delete': {
        deleteCmd(args);
        break;
    }


    // generate a js file with env constants
    case 'gc':
    case 'generate-constants': {
        generateConstants(args);
        break;
    }

    default:
        console.error(colorText(COLORS.ERROR, `Unknown command: "${command}"\n`));
        showHelp();
        process.exit(1);
}
