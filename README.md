# @cldmv/digby-ext-server

The server extension of [Digby](https://github.com/CLDMV/digby): a [`@cldmv/rummage`](https://github.com/CLDMV/rummage#readme) extension.

The project is in active pre-release development on the [`dev`](https://github.com/CLDMV/digby-ext-server/tree/dev) branch. `master` carries only the v4 CI wiring until the first release.

## The wire codec — `@cldmv/digby-ext-wire`

The DNS wire codec is its own extension, [`@cldmv/digby-ext-wire`](https://github.com/CLDMV/digby-ext-wire#readme) — server no longer carries it (CLDMV/digby#42). The manifest declares `requires: ["@cldmv/digby-ext-wire"]`, so the loader mounts and activates wire before server's root leaf runs, and server's `activate()` imports `self` from `@cldmv/rummage/runtime` and throws unless `self.wire.decode` is a function — a missing or unpublished wire surface fails the mount loudly, instead of surfacing later as a decode-time error. Server reaches the codec only through the composed surface (`self.wire.*`), never a deep import of another extension's lib:

- **messages**: `decode`, `encode`, `messages.encode.capped`
- **records / names / rdata / ttl**: `record.parse` / `record.format`, `domain.parse` / `domain.format` / `domain.canonical` / `domain.key` / `domain.equal` / `domain.count`, `rdata.parse` / `rdata.format` / `rdata.encode` / `rdata.decode` / `rdata.generic`, `ttl.parse`
- **transports**: `transport.encode` / `transport.limit` / `transport.udp.min` / `transport.udp.cap`, `tcp.frame` / `tcp.max`, `framer.create`, `tsig.append` / `tsig.size`
- **data leaves** (zero-arg functions returning the frozen tables): `constants.*`, `limits.message` / `limits.label` / `limits.domain` (with `limits.domain.octets` under it), `errors.codes`
- **errors**: `errors.is(err)` is the error contract — the `WireError` CLASS is not a leaf, because a composed instance is a separate module copy and `instanceof` is false across the composed boundary

## License

[Apache-2.0](./LICENSE)
