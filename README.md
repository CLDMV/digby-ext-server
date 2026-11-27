# @cldmv/digby-ext-server

The server extension of [Digby](https://github.com/CLDMV/digby): a [`@cldmv/rummage`](https://github.com/CLDMV/rummage#readme) extension.

The project is in active pre-release development on the [`dev`](https://github.com/CLDMV/digby-ext-server/tree/dev) branch. `master` carries only the v4 CI wiring until the first release.

## The wire codec — now `@cldmv/digby-ext-wire`

The DNS wire codec is its own extension, [`@cldmv/digby-ext-wire`](https://github.com/CLDMV/digby-ext-wire#readme) — server no longer carries it (CLDMV/digby#42). The manifest declares `requires: ["@cldmv/digby-ext-wire"]`, so the wire surface is mounted and activated before server's root leaf runs (which touches `self.wire` to fail fast if it is missing), and consumers reach it as `self.wire.*` — decode, encode, encodeCapped, the record/name/ttl/rdata parse+format helpers, the TYPE/CLASS/RCODE tables, `WireError` with its `WireErrorCode` codes, and `framer.create()` for TCP framing — never a deep import of another extension's lib.

## License

[Apache-2.0](./LICENSE)
