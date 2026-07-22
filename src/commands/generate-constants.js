import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { colorText } from '../help.js';
import { COLORS } from '../constants.js';

export function generateConstants(args) {
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
        .filter(line => !line.trim().startsWith('#') && line.trim() !== '' && line.includes('='))
        .map(line => line.split('=')[0].trim());

    if (entries.length === 0) {
        console.log(colorText(COLORS.WARN, `No variables found in ${targetFile}`));
        return;
    }

    const envFields = entries.map(key => `\t${JSON.stringify(key)}: process.env[${JSON.stringify(key)}],`).join('\n');
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
}
