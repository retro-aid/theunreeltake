# API documentation

TypeDoc builds the reference for exported TypeScript declarations in `src/` and saves the generated HTML site under `docs/api/`. The HTML is generated output; update source TSDoc comments and regenerate it rather than editing those pages by hand.

## Generate and review

From the project root, run:

```sh
pnpm install
pnpm run docs
```

Open `docs/api/index.html` to browse the API. Before each sprint is closed, run:

```sh
pnpm run docs:sprint
```

This regenerates the reference and runs TypeDoc's undocumented declaration validation. Review the warnings, add or improve TSDoc on public functions, types, and values, then rerun the command.

## Current coverage snapshot

The first TypeDoc run generated the HTML site and reported 278 undocumented declarations. Regenerate and run the coverage check to get the actionable count for project-owned declarations. The setup baseline source scan found 65 block-style `/** ... */` comment blocks and 239 exported function-like declarations across `src/`; this is a rough indicator, not a coverage percentage.

To raise coverage, start with exported functions in `src/lib/actions/` and `src/lib/dal/`, where behavior and side effects benefit most from caller-facing documentation. Next cover schemas and DTO/type aliases, then reusable component props and exported UI components. Add context on validation rules, database effects, and authorization boundaries. Keep intentional internal APIs out of the export surface where possible; document public exports and use the validation warning list to track the remainder.
