import fs from 'fs';
import path from 'path';

// get CLI arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log("Usage: env-creator <command> [options]");
    console.log("Commands:");
    console.log("  create                  Create an empty .env file");
    console.log("  create-from-json <json> [--env <name>] Create .env or .env.<name> from JSON");
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

    // create a .env from JSON
    case 'create-from-json': {
        const jsonFile = args[1];

        if (!jsonFile) {
            console.error('Please provide a JSON file');
            process.exit(1);
        }

        if (!fs.existsSync(jsonFile)) {
            console.error('JSON file not found');
            process.exit(1);
        }

        const envArgIndex = args.indexOf('--env');
        const envSuffix = (envArgIndex !== -1 && args[envArgIndex + 1]) ? `.${args[envArgIndex + 1]}` : '';
        const targetEnvFile = `.env${envSuffix}`;

        const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
        let envContent = '';

        for (const key in jsonData) {
            envContent += `${key}=${jsonData[key]}\n`;
        }

        fs.writeFileSync(targetEnvFile, envContent);
        console.log(`Created ${targetEnvFile} from JSON`);
        break;
    }

    default:
        console.error('Unknown command');
        process.exit(1);
}
