import fs from 'fs';
import { colorText } from '../help.js';
import { COLORS } from '../constants.js';
import { parseCommandArgs } from '../utils/cli-parser.js';

export function createFromJson(args) {
    const { values, positionals } = parseCommandArgs(args, {
        env: { type: 'string', short: 'e' }
    });

    const jsonFile = positionals[0];

    if (!jsonFile) {
        console.error(colorText(COLORS.ERROR, 'Please provide a JSON file'));
        process.exit(1);
    }

    if (!fs.existsSync(jsonFile)) {
        console.error(colorText(COLORS.ERROR, 'JSON file not found'));
        process.exit(1);
    }

    const envSuffix = values.env ? `.${values.env}` : '';
    const targetEnvFile = `.env${envSuffix}`;

    if (fs.existsSync(targetEnvFile)) {
        console.log(colorText(COLORS.WARN, `${targetEnvFile} already exists`));
        return;
    }

    let rawData;

    try {
        rawData = fs.readFileSync(jsonFile, 'utf-8');
    } catch (err) {
        console.error(colorText(COLORS.ERROR, `Failed to read file "${jsonFile}": ${err.message}`));
        process.exit(1);
    }

    let jsonData;

    try {
        jsonData = JSON.parse(rawData);
    } catch (err) {
        console.error(colorText(COLORS.ERROR, `Invalid JSON in "${jsonFile}": ${err.message}`));
        process.exit(1);
    }

    if (typeof jsonData !== 'object' || jsonData === null || Array.isArray(jsonData)) {
        console.error(colorText(COLORS.ERROR, `JSON root must be an object in "${jsonFile}"`));
        process.exit(1);
    }

    let envContent = '';

    for (const [key, val] of Object.entries(jsonData)) {
        let formattedVal;

        if (val === null || val === undefined) {
            formattedVal = '';
        } else if (typeof val === 'object') {
            formattedVal = JSON.stringify(val);
        } else {
            formattedVal = String(val);
        }

        envContent += `${key}=${formattedVal}\n`;
    }

    fs.writeFileSync(targetEnvFile, envContent);

    console.log(colorText(COLORS.SUCCESS, `Created ${targetEnvFile} from JSON`));
}
