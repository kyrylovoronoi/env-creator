import fs from 'fs';
import path from 'path';
import { colorText } from '../help.js';
import { COLORS } from '../constants.js';
import { parseCommandArgs } from '../utils/cli-parser.js';

function deleteFn(args) {
    const { positionals } = parseCommandArgs(args);
    const targetFile = positionals[0] || '.env';
    const targetPath = path.join(process.cwd(), targetFile);

    if (!fs.existsSync(targetPath)) {
        console.log(colorText(COLORS.WARN, `File ${targetFile} does not exist`));
    } else {
        fs.unlinkSync(targetPath);
        console.log(colorText(COLORS.SUCCESS, `Deleted ${targetFile}`));
    }
}

export { deleteFn as delete };
