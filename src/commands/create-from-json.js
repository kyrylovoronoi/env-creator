import fs from 'fs';
import { colorText } from '../help.js';
import { COLORS } from '../constants.js';

export function createFromJson(args) {
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
        return;
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
    let envContent = '';

    for (const key in jsonData) {
        envContent += `${key}=${jsonData[key]}\n`;
    }

    fs.writeFileSync(targetEnvFile, envContent);
    console.log(colorText(COLORS.SUCCESS, `Created ${targetEnvFile} from JSON`));
}
