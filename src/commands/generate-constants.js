import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { colorText } from '../help.js';
import { COLORS } from '../constants.js';
import { parseCommandArgs } from '../utils/cli-parser.js';
import { parseEnvContent } from '../utils/env.js';

export function generateConstants(args) {
    const { values, positionals } = parseCommandArgs(args, {
        out: { type: 'string', short: 'o' },
        force: { type: 'boolean', short: 'f' }
    });

    const outFileName = values.out || 'envConstants.js';
    const isForce = Boolean(values.force);
    let targetFile = positionals[0] || '.env';
    let targetPath = path.join(process.cwd(), targetFile);

    if (!fs.existsSync(targetPath)) {
        const files = fs.readdirSync(process.cwd());
        const envFiles = files.filter(f => f.startsWith('.env') && !f.endsWith('.example'));

        if (envFiles.length > 0) {
            targetFile = envFiles[0];
            targetPath = path.join(process.cwd(), targetFile);
            console.log(colorText(COLORS.WARN, `File ${positionals[0] || '.env'} not found. Using ${targetFile} instead.`));
        } else {
            console.error(colorText(COLORS.ERROR, `File ${targetFile} does not exist and no fallback .env* files were found`));
            process.exit(1);
        }
    }

    const rawContent = fs.readFileSync(targetPath, 'utf-8');
    const entries = parseEnvContent(rawContent).map(({ key }) => key);

    if (entries.length === 0) {
        console.log(colorText(COLORS.WARN, `No variables found in ${targetFile}`));
        return;
    }

    const envFields = entries.map(key => `\t${JSON.stringify(key)}: process.env[${JSON.stringify(key)}],`).join('\n');
    const constantsContent = `export const ENV = {\n${envFields}\n};\n`;
    const outputPath = path.join(process.cwd(), outFileName);

    if (fs.existsSync(outputPath) && !isForce) {
        if (!process.stdin.isTTY) {
            console.error(colorText(COLORS.ERROR, `File ${outFileName} already exists. Use -f or --force to overwrite in non-interactive environments.`));
            process.exit(1);
        }

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
        const fileExisted = fs.existsSync(outputPath);

        fs.writeFileSync(outputPath, constantsContent);

        if (fileExisted) {
            console.log(colorText(COLORS.SUCCESS, `Overwrote ${outFileName} from ${targetFile}`));
        } else {
            console.log(colorText(COLORS.SUCCESS, `Generated ${outFileName} from ${targetFile}`));
        }
    }
}
