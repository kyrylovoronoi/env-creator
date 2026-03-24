import fs from 'fs';
import path from 'path';

// get CLI arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    showHelp();
    process.exit(0);
}

function showHelp() {
    console.log("Usage: env-creator <command> [options]");
    console.log("   or: env <command> [options]");
    console.log("Commands:");
    console.log("  c, create [KEY=value...]   Create a .env file (optionally with values)");
    console.log("  cfj, create-from-json <json> [--env <name>] Create .env or .env.<name> from JSON");
    console.log("  s, split --env <dev|prod>  Create environment-specific file from .env");
    console.log("  d, delete [file]           Delete an environment file (default: .env)");
    console.log("  srt, sort [file]           Sort keys alphabetically in an env file (default: .env)");
    console.log("Options:");
    console.log("  -h, --help              Show this help message");
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
        const envPath = path.join(process.cwd(), '.env');

        if (fs.existsSync(envPath)) {
            console.log('.env already exists');
        } else {
            const fieldsArgs = args.slice(1);
            let envContent = '';

            if (fieldsArgs.length > 0) {
                const validFields = fieldsArgs.filter(arg => arg.includes('='));
                envContent = validFields.join('\n') + (validFields.length > 0 ? '\n' : '');
            }

            fs.writeFileSync(envPath, envContent);

            if (envContent) {
                console.log('Created .env with specified fields');
            } else {
                console.log('Created empty .env');
            }
        }

        break;
    }

    // create a .env from JSON
    case 'cfj':
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

        if (fs.existsSync(targetEnvFile)) {
            console.log(`${targetEnvFile} already exists`);
            break;
        }

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
    case 's':
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

        if (fs.existsSync(targetPath)) {
            console.log(`.env.${envName} already exists`);
            break;
        }

        fs.writeFileSync(targetPath, strippedLines);
        console.log(`Created .env.${envName} with keys only`);
        break;
    }

    // delete an environment file
    case 'd':
    case 'delete': {
        const targetFile = args[1] || '.env';
        const targetPath = path.join(process.cwd(), targetFile);

        if (!fs.existsSync(targetPath)) {
            console.log(`File ${targetFile} does not exist`);
        } else {
            fs.unlinkSync(targetPath);
            console.log(`Deleted ${targetFile}`);
        }

        break;
    }

    // sort keys in an env file alphabetically
    case 'srt':
    case 'sort': {
        const targetFile = args[1] || '.env';
        const targetPath = path.join(process.cwd(), targetFile);

        if (!fs.existsSync(targetPath)) {
            console.error(`File ${targetFile} does not exist`);
            process.exit(1);
        }

        const rawLines = fs.readFileSync(targetPath, 'utf-8').split(/\r?\n/);

        // strip trailing empty line if file ends with a newline
        const lines = rawLines[rawLines.length - 1] === '' ? rawLines.slice(0, -1) : rawLines;

        const entries = lines
            .filter(line => !line.startsWith('#') && line.trim() !== '' && line.includes('='))
            .sort((a, b) => a.localeCompare(b));

        let entryIdx = 0;

        const sorted = lines.map(line => {
            if (!line.startsWith('#') && line.trim() !== '' && line.includes('=')) {
                return entries[entryIdx++];
            }

            return line;
        });

        fs.writeFileSync(targetPath, sorted.join('\n') + '\n');
        console.log(`Sorted keys in ${targetFile}`);
        break;
    }

    default:
        console.error(`Unknown command: "${command}"\n`);
        showHelp();
        process.exit(1);
}
