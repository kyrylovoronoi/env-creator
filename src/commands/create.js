import fs from 'fs';
import path from 'path';
import { colorText } from '../help.js';
import { COLORS } from '../constants.js';

export function create(args) {
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
}
