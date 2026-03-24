# env-creator

A fast, lightweight CLI tool for managing and generating custom environment (`.env`) files, designed to simplify development by enabling multiple .env configurations for different environments, as well as automatically generating JavaScript constants for direct use within the project.

## Installation

You can install `env-creator` locally in your project (recommended) or globally.

### Local Installation

Install as a development dependency:

```bash
npm install env-creator --save-dev
# or
pnpm add -D env-creator
# or
yarn add -D env-creator
```

Then run it using your package manager's runner:

```bash
npx env-creator create
# or
pnpx env-creator create
# or (Yarn Berry)
yarn dlx env-creator create
# or (Yarn Classic)
yarn env-creator create
```

### Global Installation

If you prefer to use it across all projects:

```bash
npm install -g env-creator
# or
pnpm add -g env-creator
# or
yarn global add env-creator
```

Then run it directly:

```bash
env-creator create
```

## Usage (examples for `pnpm`)

`env-creator` (also available as `env`) provides several commands (along with their short aliases, e.g. `c` for `create`) to help you quickly set up or split your environment files.

### 1. Create an empty or pre-filled `.env` file (alias: `c`)

Generates a `.env` file in the current working directory. You can optionally pass `KEY=VALUE` pairs to pre-fill it. If a file already exists, it will not overwrite it.

```bash
pnpx env-creator create
```

**With initial fields:**
```bash
pnpx env-creator create PORT=3000 NODE_ENV=development
# or short version
pnpx env c PORT=3000 NODE_ENV=development
```

**Resulting `.env`:**
```env
PORT=3000
NODE_ENV=development
```

### 2. Create from JSON (alias: `cfj`)

Generates a `.env` target file from a provided JSON file. The keys and values in the JSON file will be converted into `KEY=VALUE` format.
You can optionally provide an `--env <name>` flag to create a specific `.env.<name>` file (e.g., `.env.production`).

```bash
pnpx env-creator create-from-json <path-to-file.json> [--env <name>]
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
pnpx env-creator create-from-json config.json --env production
```

**Resulting `.env.production`:**
```env
PORT=3000
DB_HOST=localhost
NODE_ENV=development
```

### 3. Split `.env` for specific environments (alias: `s`)

Reads your existing `.env` file, removes all comments and values, and creates a new target file containing **only the keys** (e.g., for creating a `.env.example` or `.env.production` template).

```bash
pnpx env-creator split --env <env-name>
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
pnpx env-creator split --env production
```

Will generate a new file named `.env.production` with empty values:
```env
DB_USER=
DB_PASS=
```

### 4. Delete an `.env` file (alias: `d`)

Deletes a specific environment file. If no filename is provided, it defaults to deleting `.env`.

```bash
pnpx env-creator delete [file]
```

**Examples:**
```bash
pnpx env-creator delete				# Deletes .env
pnpx env-creator delete .env.production		# Deletes .env.production
```

### 5. Sort `.env` keys alphabetically (alias: `srt`)

Reads an environment file and reorders all `KEY=VALUE` lines alphabetically. Comments and empty lines are preserved at the top of the file. Defaults to `.env` if no file is specified.

```bash
pnpx env-creator sort [file]
```

**Examples:**
```bash
pnpx env-creator sort               	# Sorts .env
pnpx env-creator sort .env.production	# Sorts .env.production
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

### 6. Generate environment constants (alias: `gc`)

Reads an environment file (defaults to `.env`), extracts the keys, and creates a JavaScript file exporting each key inside a constant object (defaults to `envConstants.js`). You can specify a custom output file using the `--out` flag.

```bash
pnpx env-creator generate-constants [file] [--out <filename>]
```

**Examples:**
```bash
pnpx env gc					# Generates envConstants.js from .env by default
pnpx env gc .env.production			# Generates envConstants.js from .env.production
pnpx env gc --out myConfig.js			# Generates myConfig.js from .env
pnpx env gc .env.production --out config/env.js # Generates config/env.js from .env.production
```

**Resulting `envConstants.js`:**
```javascript
export const ENV = {
	API_URL: process.env.API_URL,
	JWT_SECRET: process.env.JWT_SECRET,
};
```

> [!IMPORTANT]
> There is no `process` object in the browser. To use these constants on the client-side, you must inject the environment variables using your bundler.
>
> **Example for Webpack** (other bundlers like Vite or Rollup will require their own specific configuration):
>
> ```javascript
> import webpack from "webpack";
> import dotenv from "dotenv";
> import path from "path"; // if needed
>
> // load environment variables from .env
> const env = dotenv.config().parsed;
> // load environment variables from a specific .env file (for example, .env.production)
> // const env = dotenv.config({ path: path.resolve(__dirname, `../.env.${envName}`) }).parsed;
>
> // convert to an object for DefinePlugin
> const envKeys = Object.keys(env).reduce((acc, key) => {
>   acc[`process.env.${key}`] = JSON.stringify(env[key]);
>   return acc;
> }, {});
>
> // inject variables passing them into DefinePlugin
> export default {
>   // ...
>   plugins: [
>     new webpack.DefinePlugin({ ...envKeys }),
>   ],
> };
> ```

Now you can easily import these constants anywhere in your project:

```javascript
import { ENV } from "[pathToFile]/envConstants";

console.log(`API URL: ${ENV.API_URL}`); // delete after checking
```

## Development

If you want to contribute or modify the tool, you can clone the repository and use the built-in npm scripts:

### Linting
To check the code for syntax and style errors using ESLint:
```bash
pnpx run lint
```

### Building
The project uses `esbuild` to bundle and minify the code into a single executable file in the `dist/` directory:
```bash
pnpx run build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
