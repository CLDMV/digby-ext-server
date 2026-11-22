# @cldmv/digby-ext-server

The server extension of [Digby](https://github.com/CLDMV/digby): a [`@cldmv/rummage`](https://github.com/CLDMV/rummage#readme) extension.

The project is in active pre-release development on the [`dev`](https://github.com/CLDMV/digby-ext-server/tree/dev) branch. `master` carries only the v4 CI wiring until the first release.

## The wire codec (`src/lib/wire/`)

A pure DNS message codec: no I/O, no network, `node:` built-ins only. The listeners and the query engine build on it, and `digby-ext-zones` uses its presentation parser to validate rdata.

```js
import { decodeMessage, encodeForTransport, parseRecord, formatRecord, WireError } from "./src/lib/wire/index.mjs";

const query = decodeMessage(datagram); // throws WireError (with a stable .code) on anything malformed
const { bytes, truncated } = encodeForTransport(response, { transport: "udp", query }); // 512, or the EDNS size capped at 1232
const rec = parseRecord("www 300 IN A 192.0.2.1", { origin: "example." });
formatRecord(rec); // "www.example. 300 IN A 192.0.2.1"
```

- **Messages** (RFC 1035): header, questions and the three record sections. EDNS(0) is lifted into `message.edns` and the 12-bit rcode is reassembled; a TSIG record must be last.
- **Names**: strings in canonical presentation form (absolute, case kept, RFC 1035 escapes). Encoding compresses owner names, questions and the rdata of NS, CNAME, SOA, PTR and MX. Decoding accepts pointers only to before the segment being read, so loops and forward pointers are refused, and it refuses labels over 63 octets and names over 255.
- **Typed rdata** for A, AAAA, NS, CNAME, SOA, PTR, MX, TXT, SRV, CAA, NAPTR, TLSA, SSHFP, SVCB and HTTPS (with typed SvcParams), DS, DNSKEY, RRSIG, NSEC, NSEC3, NSEC3PARAM, CDS, CDNSKEY, TSIG and OPT. Every other type is RFC 3597 opaque octets (`{ data }`, `TYPEnnn`, `\# len hex`).
- **EDNS options**: cookie, tcp-keepalive, padding and extended DNS error are typed. Others pass through raw.
- **Limits**: rdlength must match what the type parses. Nothing is allocated from a claimed count. A message is at most 65535 octets. `encodeForTransport` truncates to the UDP or TCP limit by dropping whole RRsets (RFC 2181 9) and keeps OPT and TSIG. `frameTcp` and `TcpFramer` handle the 2-octet TCP length prefix.
- **Errors**: everything the codec reports is a `WireError` whose `code` is one of `WireErrorCode`.

The tests (`tests/wire/`) cover round-trips for every type, the pointer and length guards, truncation, a corpus of RFC-derived messages and records (`tests/fixtures/wire/`), seeded property tests and a bounded fuzz run. The fuzz run prints its seed; replay it with `DIGBY_FUZZ_SEED=<seed> npm test -- wire/fuzz`.

## License

[Apache-2.0](./LICENSE)
