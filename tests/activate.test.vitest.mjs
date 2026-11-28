/**
 *	@Project: @cldmv/digby-ext-server
 *	@Filename: /tests/activate.test.vitest.mjs
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
 * @fileoverview The wire fail-fast, unit-side: `activate()` reached OUTSIDE a composed host has no wire surface
 * to read — slothlet's `self` fails closed off-extent — so the fail-fast must answer the clear error naming the
 * wire extension and the surface it checked, not whatever the runtime's off-extent refusal happens to say. The
 * composed side of the same guarantee lives in tests/compose.test.vitest.mjs (the real boot, wire activated
 * before server).
 */

import { describe, expect, it } from "vitest";
import { activate } from "../src/api/server/server.mjs";

/** A context that satisfies setupSettings, with nothing else — no composed host behind it. */
const stubContext = () => ({
	storage: { settings: { get: async () => undefined, set: async () => undefined } },
	extId: "digby.server",
	commands: { register() {} }
});

describe("activate() fails fast on a missing wire surface (CLDMV/digby#42)", () => {
	it("throws the clear wire error when no composed host is behind the call", () => {
		expect(() => activate(stubContext())).toThrow(/@cldmv\/digby-ext-wire/);
		expect(() => activate(stubContext())).toThrow(/self\.wire\.decode/);
	});
});
