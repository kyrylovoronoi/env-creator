import fs from 'fs';
import path from 'path';
import { colorText } from '../help.js';
import { COLORS } from '../constants.js';
import { parseCommandArgs } from '../utils/cli-parser.js';
import { parseEnvLine } from '../utils/env.js';

export function sort(args) {
    const { values, positionals } = parseCommandArgs(args, {
        groups: { type: 'boolean', short: 'g' }
    });

    const hasGroups = Boolean(values.groups);
    const targetFile = positionals[0] || '.env';
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
            const parsed = parseEnvLine(line);

            if (parsed) {
                currentVars.push(line);
            } else {
                if (currentVars.length > 0) {
                    currentVars.sort((a, b) => parseEnvLine(a).key.localeCompare(parseEnvLine(b).key));
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
            currentVars.sort((a, b) => parseEnvLine(a).key.localeCompare(parseEnvLine(b).key));
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
            const parsed = parseEnvLine(line);

            if (parsed) {
                blocks.push({
                    header: currentHeader,
                    entry: line,
                    key: parsed.key
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

