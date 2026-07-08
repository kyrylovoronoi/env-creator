import fs from 'fs';
import path from 'path';
import { colorText } from '../help.js';
import { COLORS } from '../constants.js';

function deleteFn(args) {
    const targetFile = args[1] || '.env';
    const targetPath = path.join(process.cwd(), targetFile);

    if (!fs.existsSync(targetPath)) {
        console.log(colorText(COLORS.WARN, `File ${targetFile} does not exist`));
    } else {
        fs.unlinkSync(targetPath);
        console.log(colorText(COLORS.SUCCESS, `Deleted ${targetFile}`));
    }
}

export { deleteFn as delete };
