/**
 *	@Project: @cldmv/digby-ext-server
 *	@Filename: /tests/manifest.test.vitest.mjs
 */

import { describe, expect, it } from "vitest";
import manifest from "../rummage.manifest.mjs";

describe("rummage.manifest.mjs", () => {
	it("declares the extension protocol and the i18n prefix", () => {
		expect(manifest.protocol).toEqual({ version: "1.0" });
		expect(manifest.i18n).toEqual({ prefix: "server" });
	});
});
