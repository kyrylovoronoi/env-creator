import fs from 'fs';
import path from 'path';
import { colorText } from '../help.js';
import { COLORS } from '../constants.js';

export function sort(args) {
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
            const isVar = !line.trim().startsWith('#') && line.trim() !== '' && line.includes('=');

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
            const isVar = !line.trim().startsWith('#') && line.trim() !== '' && line.includes('=');

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
}
