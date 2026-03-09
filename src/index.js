import fs from 'fs';
import path from 'path';

// get CLI arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log("Usage: env-creator <command> [options]");
    console.log("Commands:");
    console.log("  create                  Create an empty .env file");
    console.log("  create-from-json <json> [--env <name>] Create .env or .env.<name> from JSON");
    console.log("  split --env <dev|prod>  Create environment-specific file from .env");
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

    // create .env.[name] with empty values
    case 'split': {
        const envArgIndex = args.indexOf('--env');

        if (envArgIndex === -1 || !args[envArgIndex + 1]) {
            console.error('Please specify environment with --env <dev|prod>');
            process.exit(1);
        }

        const envName = args[envArgIndex + 1];
        const sourcePath = path.join(process.cwd(), '.env');

        if (!fs.existsSync(sourcePath)) {
            console.error('.env file not found');
            process.exit(1);
        }

        const lines = fs.readFileSync(sourcePath, 'utf-8').split(/\r?\n/);
        const strippedLines = lines
            .filter(line => line.trim() !== '' && !line.startsWith('#'))
            .map(line => line.split('=')[0] + '=')
            .join('\n');
        const targetPath = path.join(process.cwd(), `.env.${envName}`);

        fs.writeFileSync(targetPath, strippedLines);
        console.log(`Created .env.${envName} with keys only`);
        break;
    }

    default:
        console.error('Unknown command');
        process.exit(1);
}
