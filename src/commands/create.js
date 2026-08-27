import fs from 'fs';
import path from 'path';
import { colorText } from '../help.js';
import { COLORS } from '../constants.js';
import { parseCommandArgs } from '../utils/cli-parser.js';
import { parseEnvLine } from '../utils/env.js';

export function create(args) {
    const { values, positionals } = parseCommandArgs(args, {
        env: { type: 'string', short: 'e' }
    });

    const envSuffix = values.env ? `.${values.env}` : '';
    const envFileName = `.env${envSuffix}`;
    const envPath = path.join(process.cwd(), envFileName);

    if (fs.existsSync(envPath)) {
        console.log(colorText(COLORS.WARN, `${envFileName} already exists`));
    } else {
        let envContent = '';

        if (positionals.length > 0) {
            const validFields = positionals.filter(arg => parseEnvLine(arg) !== null);
            envContent = validFields.join('\n') + (validFields.length > 0 ? '\n' : '');
        }

        fs.writeFileSync(envPath, envContent);

        if (envContent) {
            console.log(colorText(COLORS.SUCCESS, `Created ${envFileName} with specified fields`));
        } else {
            console.log(colorText(COLORS.SUCCESS, `Created empty ${envFileName}`));
        }
    }
}

