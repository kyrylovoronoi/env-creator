import fs from 'fs';
import path from 'path';
import { colorText } from '../help.js';
import { COLORS } from '../constants.js';

export function split(args) {
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
        .filter(line => line.trim() !== '' && !line.trim().startsWith('#') && line.includes('='))
        .map(line => line.split('=')[0] + '=')
        .join('\n');
    const targetPath = path.join(process.cwd(), `.env.${envName}`);

    if (fs.existsSync(targetPath)) {
        console.log(colorText(COLORS.WARN, `.env.${envName} already exists`));
        return;
    }

    fs.writeFileSync(targetPath, strippedLines);
    console.log(colorText(COLORS.SUCCESS, `Created .env.${envName} with keys only`));
}
