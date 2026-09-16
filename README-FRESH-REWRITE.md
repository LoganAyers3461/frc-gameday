# FieldView fresh component rewrite

This archive is intended to be extracted over the `nexus-api-rewrite` checkout.

It replaces the application hooks/components with the debloated architecture discussed in the refactor:

- four centralized polling tiers
- one match resource hook with local derivation
- one tracked-match derivation hook
- no legacy aggregate `useGameday`
- no legacy single-team `useActiveTeam`
- no duplicate `useTracking`
- typed team-status map
- stream selection isolated in `useStreamController`
- Multiview remains responsible only for layout/order/presentation context
- GamedayWidget owns only widget orchestration and local UI state
- local countdown/timing loops remain local

The `/api/event/[event]/matches/next` and `/api/event/[event]/matches/last` endpoints are intentionally untouched.

## Apply

Extract this archive at the repository root, then run:

```bash
./cleanup.sh
```

No dependencies are changed and no build/install step is performed by this archive.
