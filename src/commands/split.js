import fs from 'fs';
import path from 'path';
import { colorText } from '../help.js';
import { COLORS } from '../constants.js';
import { parseCommandArgs } from '../utils/cli-parser.js';

export function split(args) {
    const { values, positionals } = parseCommandArgs(args, {
        env: { type: 'string', short: 'e' }
    });

    const envName = values.env;

    if (!envName) {
        console.error(colorText(COLORS.ERROR, 'Please specify environment with --env <dev|prod>'));
        process.exit(1);
    }

    const sourceFile = positionals[0] || '.env';
    const sourcePath = path.join(process.cwd(), sourceFile);

    if (!fs.existsSync(sourcePath)) {
        console.error(colorText(COLORS.ERROR, `${sourceFile} file not found`));
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
