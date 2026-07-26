# Repository Guidelines

## Project Structure & Module Organization

The React 19 and TypeScript frontend lives in `src/`: reusable UI belongs in `src/components/`, route-level screens in `src/views/`, shared state in `src/context/`, and Tauri bindings/helpers in `src/lib/`. Translations are under `src/i18n/`; static agent icons and bundled assets live in `public/` and `assets/`. The Tauri/Rust application is in `src-tauri/`: commands expose the desktop API, `core/` owns storage, sync, Git, and installation logic, and `src/bin/skills-manager-cli.rs` provides the CLI over the same core. Utility and release scripts live in `scripts/`; CI definitions are in `.github/workflows/`.

## Build, Test, and Development Commands

- `npm install` installs the locked JavaScript dependencies.
- `npm run tauri:dev` starts the Vite frontend inside the Tauri desktop shell.
- `npm run build` type-checks and builds the frontend; `npm run tauri:build` creates the desktop bundle.
- `npm run lint` runs ESLint across TypeScript and React code.
- `cargo test --manifest-path src-tauri/Cargo.toml` runs the Rust test suite.
- `cargo check --manifest-path src-tauri/Cargo.toml` performs a faster backend compile check.
- `npm run cli -- skills list` runs the development CLI; use `npm run cli:build` for a release binary.

## Coding Style & Naming Conventions

Follow existing TypeScript formatting: two-space indentation, double quotes, and semicolons. Use `PascalCase` for React components and their files, `camelCase` for hooks/helpers, and prefix hooks with `use`. Keep translation keys synchronized across `src/i18n/*.json`. Rust code follows `rustfmt`, with `snake_case` modules/functions and `PascalCase` types. Run `npm run lint` and `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` before submitting.

## Testing Guidelines

Rust tests use the built-in test framework, usually as nearby `#[cfg(test)]` modules; integration-heavy merge tests live in `src-tauri/src/core/merge/integration_tests.rs`. Name tests after observable behavior, for example `sync_skill_refuses_target_inside_source`. Add regression coverage for bug fixes, including platform-gated cases where Windows junction and Unix symlink behavior differ. No repository-wide coverage threshold is defined.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commit-style subjects such as `fix(settings): ...`, `feat(backup): ...`, `test(install): ...`, `docs: ...`, and `chore: ...`. Keep commits focused and use an imperative, specific subject. Pull requests should explain the user-visible change, link relevant issues, list validation commands, and include screenshots or recordings for UI changes. Call out platform-specific behavior and data-migration or sync risks explicitly.
