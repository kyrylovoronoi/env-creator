import fs from 'fs';
import path from 'path';
import readline from 'readline';
import util from 'util';

const COLORS = {
    SUCCESS: 'green',
    WARN: 'yellow',
    ERROR: 'red'
};

function colorText(color, text) {
    return typeof util.styleText === 'function' ? util.styleText(color, text) : text;
}

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
    console.log("  srt, sort [-g/--groups] [file] Sort keys alphabetically (default: .env). Use -g to sort inside existing groups.");
    console.log("  gc, generate-constants [file] [--out <file>] Generate a JS file with env variable constants");
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
            console.log(colorText(COLORS.WARN, '.env already exists'));
        } else {
            const fieldsArgs = args.slice(1);
            let envContent = '';

            if (fieldsArgs.length > 0) {
                const validFields = fieldsArgs.filter(arg => arg.includes('='));
                envContent = validFields.join('\n') + (validFields.length > 0 ? '\n' : '');
            }

            fs.writeFileSync(envPath, envContent);

            if (envContent) {
                console.log(colorText(COLORS.SUCCESS, 'Created .env with specified fields'));
            } else {
                console.log(colorText(COLORS.SUCCESS, 'Created empty .env'));
            }
        }

        break;
    }

    // create a .env from JSON
    case 'cfj':
    case 'create-from-json': {
        const jsonFile = args[1];

        if (!jsonFile) {
            console.error(colorText(COLORS.ERROR, 'Please provide a JSON file'));
            process.exit(1);
        }

        if (!fs.existsSync(jsonFile)) {
            console.error(colorText(COLORS.ERROR, 'JSON file not found'));
            process.exit(1);
        }

        const envArgIndex = args.indexOf('--env');
        const envSuffix = (envArgIndex !== -1 && args[envArgIndex + 1]) ? `.${args[envArgIndex + 1]}` : '';
        const targetEnvFile = `.env${envSuffix}`;

        if (fs.existsSync(targetEnvFile)) {
            console.log(colorText(COLORS.WARN, `${targetEnvFile} already exists`));
            break;
        }

        const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
        let envContent = '';

        for (const key in jsonData) {
            envContent += `${key}=${jsonData[key]}\n`;
        }

        fs.writeFileSync(targetEnvFile, envContent);
        console.log(colorText(COLORS.SUCCESS, `Created ${targetEnvFile} from JSON`));
        break;
    }

    // create .env.[name] with empty values
    case 's':
    case 'split': {
        const envArgIndex = args.indexOf('--env');

        if (envArgIndex === -1 || !args[envArgIndex + 1]) {
            console.error(colorText(COLORS.ERROR, 'Please specify environment with --env <dev|prod>'));
            process.exit(1);
        }

        const envName = args[envArgIndex + 1];
        const sourcePath = path.join(process.cwd(), '.env');

        if (!fs.existsSync(sourcePath)) {
            console.error(colorText(COLORS.ERROR, '.env file not found'));
            process.exit(1);
        }

        const lines = fs.readFileSync(sourcePath, 'utf-8').split(/\r?\n/);
        const strippedLines = lines
            .filter(line => line.trim() !== '' && !line.startsWith('#'))
            .map(line => line.split('=')[0] + '=')
            .join('\n');
        const targetPath = path.join(process.cwd(), `.env.${envName}`);

        if (fs.existsSync(targetPath)) {
            console.log(colorText(COLORS.WARN, `.env.${envName} already exists`));
            break;
        }

        fs.writeFileSync(targetPath, strippedLines);
        console.log(colorText(COLORS.SUCCESS, `Created .env.${envName} with keys only`));
        break;
    }

    // delete an environment file
    case 'd':
    case 'delete': {
        const targetFile = args[1] || '.env';
        const targetPath = path.join(process.cwd(), targetFile);

        if (!fs.existsSync(targetPath)) {
            console.log(colorText(COLORS.WARN, `File ${targetFile} does not exist`));
        } else {
            fs.unlinkSync(targetPath);
            console.log(colorText(COLORS.SUCCESS, `Deleted ${targetFile}`));
        }

        break;
    }

    // sort keys in an env file alphabetically
    case 'srt':
    case 'sort': {
        const hasGroups = args.includes('--groups') || args.includes('-g');
        const fileArg = args.slice(1).find(arg => arg !== '--groups' && arg !== '-g');
        const targetFile = fileArg || '.env';
        const targetPath = path.join(process.cwd(), targetFile);

        if (!fs.existsSync(targetPath)) {
            console.error(colorText(COLORS.ERROR, `File ${targetFile} does not exist`));
            process.exit(1);
        }

        const rawLines = fs.readFileSync(targetPath, 'utf-8').split(/\r?\n/);
        const lines = rawLines[rawLines.length - 1] === '' ? rawLines.slice(0, -1) : rawLines;
        const sortedLines = [];

        if (hasGroups) {
            let currentVars = [];

			for (const line of lines) {
                const isVar = !line.startsWith('#') && line.trim() !== '' && line.includes('=');

				if (isVar) {
                    currentVars.push(line);
                } else {
                    if (currentVars.length > 0) {
                        currentVars.sort((a, b) => a.split('=')[0].trim().localeCompare(b.split('=')[0].trim()));
                        sortedLines.push(...currentVars);
                        currentVars = [];

                        // Ensure an empty line separates the group from the next comment
                        if (line.trim() !== '') {
                            sortedLines.push('');
                        }
                    }

                    // Prevent consecutive empty lines
                    if (line.trim() === '' && sortedLines.length > 0 && sortedLines[sortedLines.length - 1].trim() === '') {
                        continue;
                    }

					sortedLines.push(line);
                }
            }

			if (currentVars.length > 0) {
                currentVars.sort((a, b) => a.split('=')[0].trim().localeCompare(b.split('=')[0].trim()));
                sortedLines.push(...currentVars);
            }

            // Remove trailing empty lines
            while (sortedLines.length > 0 && sortedLines[sortedLines.length - 1].trim() === '') {
                sortedLines.pop();
            }
        } else {
            const blocks = [];
            let currentHeader = [];

			for (const line of lines) {
                const isVar = !line.startsWith('#') && line.trim() !== '' && line.includes('=');

                if (isVar) {
                    blocks.push({
                        header: currentHeader,
                        entry: line,
                        key: line.split('=')[0].trim()
                    });
                    currentHeader = [];
                } else if (line.trim() !== '') {
                    currentHeader.push(line);
                }
            }

			blocks.sort((a, b) => a.key.localeCompare(b.key));

			for (const block of blocks) {
                sortedLines.push(...block.header);
                sortedLines.push(block.entry);
            }

			sortedLines.push(...currentHeader);
        }

        fs.writeFileSync(targetPath, sortedLines.join('\n') + '\n');
        console.log(colorText(COLORS.SUCCESS, `Sorted keys in ${targetFile}`));
        break;
    }

    // generate a js file with env constants
    case 'gc':
    case 'generate-constants': {
        const outArgIndex = args.indexOf('--out');
        const outFileName = (outArgIndex !== -1 && args[outArgIndex + 1]) ? args[outArgIndex + 1] : 'envConstants.js';
        const fileArgs = outArgIndex !== -1 ? args.filter((_, i) => i !== outArgIndex && i !== outArgIndex + 1) : args;

        let targetFile = fileArgs[1] || '.env';
        let targetPath = path.join(process.cwd(), targetFile);

        if (!fs.existsSync(targetPath)) {
            const files = fs.readdirSync(process.cwd());
            const envFiles = files.filter(f => f.startsWith('.env') && !f.endsWith('.example'));

            if (envFiles.length > 0) {
                targetFile = envFiles[0];
                targetPath = path.join(process.cwd(), targetFile);
                console.log(colorText(COLORS.WARN, `File ${args[1] || '.env'} not found. Using ${targetFile} instead.`));
            } else {
                console.error(colorText(COLORS.ERROR, `File ${targetFile} does not exist and no fallback .env* files were found`));
                process.exit(1);
            }
        }

        const rawLines = fs.readFileSync(targetPath, 'utf-8').split(/\r?\n/);
        const entries = rawLines
            .filter(line => !line.startsWith('#') && line.trim() !== '' && line.includes('='))
            .map(line => line.split('=')[0].trim());

        if (entries.length === 0) {
            console.log(colorText(COLORS.WARN, `No variables found in ${targetFile}`));
            break;
        }

        const envFields = entries.map(key => `\t${key}: process.env.${key},`).join('\n');
        const constantsContent = `export const ENV = {\n${envFields}\n};\n`;
        const outputPath = path.join(process.cwd(), outFileName);

        if (fs.existsSync(outputPath)) {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question(`File ${outFileName} already exists. Overwrite? (y/n) `, (answer) => {
                const ans = answer.trim().toLowerCase();

				if (ans === 'y' || ans === 'yes') {
                    fs.writeFileSync(outputPath, constantsContent);
                    console.log(colorText(COLORS.SUCCESS, `Overwrote ${outFileName} from ${targetFile}`));
                } else {
                    console.log(colorText(COLORS.WARN, 'Action cancelled. File was not overwritten.'));
                }

				rl.close();
            });
        } else {
            fs.writeFileSync(outputPath, constantsContent);
            console.log(colorText(COLORS.SUCCESS, `Generated ${outFileName} from ${targetFile}`));
        }

		break;
    }

    default:
        console.error(colorText(COLORS.ERROR, `Unknown command: "${command}"\n`));
        showHelp();
        process.exit(1);
}
