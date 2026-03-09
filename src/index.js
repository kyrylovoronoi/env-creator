import fs from 'fs';
import path from 'path';

// get CLI arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log("Usage: env-creator <command>");
    process.exit(0);
}

const command = args[0];

switch (command) {
    // create an empty .env
    case 'create': {
        const envPath = path.join(process.cwd(), '.env');

        if (fs.existsSync(envPath)) {
            console.log('.env already exists');
        } else {
            fs.writeFileSync(envPath, '');
            console.log('Created empty .env');
        }

        break;
    }

    default:
        console.error('Unknown command');
        process.exit(1);
}
