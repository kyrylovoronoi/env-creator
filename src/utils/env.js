/**
 * Parses a single line of a .env file.
 * @param {string} line - Raw line string
 * @returns {{ key: string, value: string } | null} Parsed key-value pair or null if invalid/comment/empty
 */
export function parseEnvLine(line) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) return null;

    const eqIdx = line.indexOf('=');

    if (eqIdx === -1) return null;

    const key = line.slice(0, eqIdx).trim();
    let value = line.slice(eqIdx + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
    }

    return { key, value };
}

/**
 * Parses full content of a .env file into array of parsed key-value objects.
 * @param {string} content - Raw content of .env file
 * @returns {Array<{ key: string, value: string }>} Array of valid key-value pairs
 */
export function parseEnvContent(content) {
    const lines = content.split(/\r?\n/);
    const result = [];

    for (const line of lines) {
        const parsed = parseEnvLine(line);

        if (parsed) {
            result.push(parsed);
        }
    }

    return result;
}
