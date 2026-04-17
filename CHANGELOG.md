# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.2] - 2026-04-17

### Added
- Jump navigation links to all CLI commands in the `README.md` Usage section.

## [1.2.1] - 2026-04-09

### Added
- Colored console output to distinctively show success (green) and error (red) messages using built-in `util.styleText`.

## [1.2.0] - 2026-04-03

### Added
- `--groups` (or `-g`) flag to the `sort` command to enable strict intra-group sorting.
- Separated `release` script in `package.json` into specific `publish:npm` and version bump scripts (`version:patch`, `version:minor`, `version:major`).

### Changed
- Default `sort` behavior now binds comments/empty lines to keys directly below them, removes all empty lines, and natively alphabetizes the entire file without breaking context.

## [1.1.1] - 2026-03-24

### Fixed
- Updated `README.md` documentation examples to correctly use `pnpm exec env` instead of `pnpx env` for executing local binary aliases without triggering remote package downloads via `dlx`.

## [1.1.0] - 2026-03-24

### Added
- Command `generate-constants` to export `.env` variables as a structured JS object.
- Short global aliases and a new package binary alias `env`.
- `build:pack` convenience script in `package.json`.

### Changed
- Migrated package manager from `npm` to `pnpm` and updated README examples to use `pnpx`.
- Removed legacy `create-env` binary alias.

## [1.0.0] - 2026-03-23

### Added
- Initial release of `env-creator` CLI.
- Command `create` to generate new `.env` files, optionally pre-filled with keys.
- Command `create-from-json` to generate `.env` configurations from a JSON file.
- Command `split` to create blank environment templates (e.g. `.env.example`).
- Command `delete` to quickly delete environment files.
- Command `sort` to alphabetically sort keys inside an `.env` file, preserving comments at the top.
