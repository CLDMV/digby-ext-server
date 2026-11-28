/*
 * @cldmv/digby-ext-server — the NODE half's root leaf. The ext-host mounts this package's
 * src/api tree at ext.<app>.server (filename-matches-folder flatten:
 * this file's exports land on the mount root). Sibling leaves reach each other
 * through slothlet's `self` — never by raw import (a raw import is a SECOND
 * module instance outside composition).
 *
 * Storage: this scaffold wires the storage tiers. If you don't need
 * persistence, delete sql/ and the setupSettings call below — the
 * extension still works without them.
 */

import { self } from "@cldmv/rummage/runtime";
import { setupSettings } from "@cldmv/rummage/storage";
import { settings as _settingsSchema } from "../../../sql/settings.mjs";
// Uncomment when you have tables to query:
// import { eq } from "@cldmv/rummage/storage";
// import { someTable } from "../../../sql/schema.mjs";

export const name = "server";

export function activate(context) {
	// Wire this extension's settings declaration to its storage scope so the
	// sibling leaves at src/api/server/settings/*.mjs can resolve what they
	// validate against + which scope to read/write. Must run before any
	// cross-extension call into our settings leaves.
	setupSettings({ settings: _settingsSchema, scope: context.storage, extId: context.extId });

	// The DNS wire codec lives in @cldmv/digby-ext-wire (CLDMV/digby#42) and the manifest requires it, so
	// the loader mounts and activates wire BEFORE this leaf runs. `self` is in-call-only — activate is a
	// call, so this is where the surface must resolve; reading it at module top level would be undefined
	// even when the host composed wire. Fail fast, loudly, with the surface named: a missing or
	// unpublished wire extension is a mount-time error, not a decode-time one.
	let wire;
	try {
		wire = self.wire;
	} catch (err) {
		throw new Error(
			`digby-ext-server requires the @cldmv/digby-ext-wire extension — reaching its surface failed (${err?.message ?? err}). Is wire in the app, and does this package declare it in its package.json dependencies?`
		);
	}
	if (typeof wire?.decode !== "function") {
		throw new Error(
			`digby-ext-server requires the @cldmv/digby-ext-wire extension — self.wire.decode is ${wire === undefined ? "undefined" : typeof wire.decode}, not a function: the wire surface is not mounted or does not publish decode`
		);
	}

	// Reading own settings (fast — the storage tier directly, no access check for self):
	// const theme = await context.storage.settings.get("theme");
	// Reading own custom tables:
	// const rows = await context.storage.db.select().from(someTable).all();

	// Register node-side commands here (the renderer reaches them via
	// context.ext.invoke("server.<cmd>", …)). Track disposables on context.
	// context.commands.register("server.hello", () => ({ ok: true }));
}

export function deactivate() {
	// Tear down anything not auto-disposed.
}
