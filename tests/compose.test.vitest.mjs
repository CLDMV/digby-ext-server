/**
 *	@Project: @cldmv/digby-ext-server
 *	@Filename: /tests/compose.test.vitest.mjs
 *	@Date: 2026-11-28T00:00:00-08:00
 *	@Author: Nate Corcoran <CLDMV>
 *	@Email: <Shinrai@users.noreply.github.com>
 *	-----
 *	@Last modified by: Nate Corcoran <CLDMV> (Shinrai@users.noreply.github.com)
 *	@Last modified time: 2026-11-28T00:00:00-08:00
 *	-----
 *	@Copyright: Copyright (c) 2013-2026 Catalyzed Motivation Inc. All rights reserved.
 *
 */

/**
 * @fileoverview The composed-surface suite: the REAL production boot of this package through rummage's
 * in-process ext-host (`@cldmv/rummage/testing` `composeTestHost`, the same thing wire's own suite boots), which
 * runs rummage's actual discovery over this package's rummage.manifest.mjs and follows the manifest's
 * `requires: ["@cldmv/digby-ext-wire"]` the way the ext-host's own discovery does — from THIS package's
 * directory, through its package.json `dependencies`. That makes this suite the discovery gate the manifest
 * test cannot be: a `requires` entry whose package the package.json does not declare does not resolve, and the
 * boot REJECTS with the ext-host's failure list (the finding the Friday review's probe recorded — CLDMV/digby#42).
 *
 * With the boot green, the two guarantees the fail-fast exists for hold end to end:
 * - wire mounts and activates BEFORE server's root leaf runs (the `requires` order), so activate's
 *   `self.wire.decode` check passes at boot — the boot itself is that assertion, and the thunk below pins the
 *   surface it checked is really a function;
 * - the error contract works across the composed boundary: a refusal a wire leaf threw satisfies
 *   `self.wire.errors.is(err)` (the `WireError` class is not a leaf — a composed instance is a separate module
 *   copy, so `instanceof` is false across the boundary; the predicate is the contract).
 */

import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { composeTestHost } from "@cldmv/rummage/testing";
import { self } from "@cldmv/rummage/runtime";

let t;
beforeAll(async () => {
	// store: null — this suite composes the wire + server pair, not the store orchestrator; app: "digby"
	// places both first-party packages at the app root (wire at `wire`, server at `server`), the shape the
	// digby app's own rummage.config composes.
	t = await composeTestHost({ ext: new URL("..", import.meta.url), store: null, app: "digby" });
}, 300_000);
afterAll(() => t?.close());

/** Where the host composed server — first-party (`server`) or third-party (`ext.<app>.server`). Probed on `.activate`, the
 * root leaf's real export: `.name` sat on a root export that always answered (a function node's own `name`, or the
 * removed `export const name`), so it proved nothing (CLDMV/digby#42 C3-4). */
const mount = () =>
	["server", "ext.digby.server", "ext.server"].find((p) => {
		try {
			return t.leaf(`${p}.activate`) !== undefined;
		} catch {
			return false;
		}
	});

describe("the composed server surface (CLDMV/digby#42)", () => {
	it("boots through real discovery — the manifest's requires resolves and server activates", () => {
		// composeTestHost ran rummage's discovery (rummage.manifest.mjs + package.json dependencies), linked and
		// declared the requires closure, mounted wire BEFORE server and ran activate() — a requires entry that
		// does not resolve, or a fail-fast that throws, rejects the beforeAll above with the failure list.
		expect(mount(), "the host composed server somewhere").toBeTruthy();
	});

	it("activate's fail-fast holds — self.wire.decode is a function through the composed host", async () => {
		const kind = await t.run(() => typeof self.wire?.decode);
		expect(kind).toBe("function");
	});

	it("a wire refusal caught through the composed api satisfies errors.is — the predicate is the contract", async () => {
		const caught = await t.run(() => {
			try {
				self.wire.domain.parse("");
				return null;
			} catch (err) {
				return [err.code, self.wire.errors.is(err)];
			}
		});
		expect(caught[0]).toBe("BAD_PRESENTATION");
		expect(caught[1]).toBe(true);
	});
});
