# TBA API typing

The Blue Alliance OpenAPI document is the source of truth for all raw TBA API types.

Run:

```bash
npm install
npm run generate:tba-types
```

This generates `src/lib/tba/generated.ts` from the current TBA OpenAPI 3.1 schema.

Do not hand-edit `generated.ts`. `src/lib/tba/types.ts` contains the small set of ergonomic aliases used by the application.

The generated file is intentionally not hand-maintained in this repository. Regenerate it whenever the TBA API schema changes.
