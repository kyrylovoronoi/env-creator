# env-creator

A fast, lightweight CLI tool for managing and generating environment (`.env`) files.

## Installation

You can install `env-creator` globally using npm:

```bash
npm install -g env-creator
```

Alternatively, you can run it directly using `npx` without installing globally:

```bash
npx env-creator <command> [options]
```

## Usage

`env-creator` provides several commands to help you quickly set up or split your environment files.

### 1. Create an Empty `.env` File

Generates a blank `.env` file in the current working directory. If a file already exists, it will not overwrite it.

```bash
env-creator create
```

### 2. Create from JSON

Generates a `.env` target file from a provided JSON file. The keys and values in the JSON file will be converted into `KEY=VALUE` format.
You can optionally provide an `--env <name>` flag to create a specific `.env.<name>` file (e.g., `.env.production`).

```bash
env-creator create-from-json <path-to-file.json> [--env <name>]
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
env-creator create-from-json config.json --env production
```

**Resulting `.env.production`:**
```env
PORT=3000
DB_HOST=localhost
NODE_ENV=development
```

### 3. Delete an `.env` File

Deletes a specific environment file. If no filename is provided, it defaults to deleting `.env`.

```bash
env-creator delete [file]
```

**Examples:**
```bash
env-creator delete            # Deletes .env
env-creator delete .env.prod  # Deletes .env.prod
```

### 4. Split `.env` for Specific Environments

Reads your existing `.env` file, removes all comments and values, and creates a new target file containing **only the keys** (e.g., for creating a `.env.example` or `.env.production` template).

```bash
env-creator split --env <env-name>
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
env-creator split --env production
```

Will generate a new file named `.env.production` with empty values:
```env
DB_USER=
DB_PASS=
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
