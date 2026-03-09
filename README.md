# env-creator

A fast, lightweight CLI tool for managing and generating environment (`.env`) files.

## Installation

You can install `env-creator` globally using npm:

```bash
npm install -g env-creator
```

Alternatively, you can run it directly using `npx` without installing globally:

```bash
npx create-env <command> [options]
# or
npx env-creator <command> [options]
```

`env-creator` (also available as `create-env`) provides several commands to help you quickly set up or split your environment files.

### 1. Create an empty or pre-filled `.env` file

Generates a `.env` file in the current working directory. You can optionally pass `KEY=VALUE` pairs to pre-fill it. If a file already exists, it will not overwrite it.

```bash
npx create-env create
```

**With initial fields:**
```bash
npx create-env create PORT=3000 NODE_ENV=development
```

**Resulting `.env`:**
```env
PORT=3000
NODE_ENV=development
```

### 2. Create from JSON

Generates a `.env` target file from a provided JSON file. The keys and values in the JSON file will be converted into `KEY=VALUE` format.
You can optionally provide an `--env <name>` flag to create a specific `.env.<name>` file (e.g., `.env.production`).

```bash
npx create-env create-from-json <path-to-file.json> [--env <name>]
```

**Example `config.json`:**
```json
{
  "PORT": 3000,
  "DB_HOST": "localhost",
  "NODE_ENV": "development"
}
```

**Command:**
```bash
npx create-env create-from-json config.json --env production
```

**Resulting `.env.production`:**
```env
PORT=3000
DB_HOST=localhost
NODE_ENV=development
```

### 3. Split `.env` for specific environments

Reads your existing `.env` file, removes all comments and values, and creates a new target file containing **only the keys** (e.g., for creating a `.env.example` or `.env.production` template).

```bash
npx create-env split --env <env-name>
```

**Example:**
If you have a `.env` file like this:
```env
# Database Config
DB_USER=admin
DB_PASS=secret
```

Running the split command for production:
```bash
npx create-env split --env production
```

Will generate a new file named `.env.production` with empty values:
```env
DB_USER=
DB_PASS=
```

### 4. Delete an `.env` file

Deletes a specific environment file. If no filename is provided, it defaults to deleting `.env`.

```bash
npx create-env delete [file]
```

**Examples:**
```bash
npx create-env delete            	# Deletes .env
npx create-env delete .env.production  # Deletes .env.production
```

### 5. Sort `.env` keys alphabetically

Reads an environment file and reorders all `KEY=VALUE` lines alphabetically. Comments and empty lines are preserved at the top of the file. Defaults to `.env` if no file is specified.

```bash
npx create-env sort [file]
```

**Examples:**
```bash
npx create-env sort               	# Sorts .env
npx create-env sort .env.production	# Sorts .env.production
```

**Before:**
```env
# App config
PORT=3000
APP_NAME=my-app
DB_HOST=localhost
```

**After:**
```env
# App config
APP_NAME=my-app
DB_HOST=localhost
PORT=3000
```

## Development

If you want to contribute or modify the tool, you can clone the repository and use the built-in npm scripts:

### Linting
To check the code for syntax and style errors using ESLint:
```bash
npm run lint
```

### Building
The project uses `esbuild` to bundle and minify the code into a single executable file in the `dist/` directory:
```bash
npm run build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
