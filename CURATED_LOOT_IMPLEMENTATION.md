# Curated, party-aware PF2e autoloot overlay

This overlay adds a new curated loot generator on top of the existing module instead of rewriting the original `generateStash` path immediately. That keeps the fork easy to test in Foundry: the old Roll Loot behavior remains available, while the new buttons and API can be exercised independently.

## Goals implemented

- Treat an Actor folder named `Party` as the authoritative current-session roster.
- Fall back to the PF2e party actor, scene tokens, then player-owned characters only if the folder has no characters.
- Keep the PF2e treasure-by-level structure: permanent items, consumables, and currency.
- Replace most mundane/junk loot with currency or useful items.
- Bias permanent items and consumables toward the current roster’s classes, traditions, and roles.
- Add a session-cadence roll that gives roughly one useful permanent item, a few useful consumables, and a fraction of level currency.
- Add a full-level curated roll that follows the official table more closely.

## Install into the fork

1. Copy `scripts/pf2e-curated-loot.js` into the repository’s `scripts/` folder.
2. Edit `module.json` and add the script after the existing main script:

```json
"scripts/pf2e-autoloot.js",
"scripts/pf2e-curated-loot.js"
```

If the manifest uses a single-line `esmodules` array, insert `"scripts/pf2e-curated-loot.js"` immediately after `"scripts/pf2e-autoloot.js"`.

3. Reload Foundry and enable the module.
4. In module settings, keep `Session party actor folder` set to `Party`, or rename it to match your session-roster folder.
5. Place only this session’s characters in the `Party` Actor folder.
6. Open a loot actor and use one of the new buttons:
   - `Session Treasure`: one relevant permanent, 2–3 relevant consumables, and fractional currency.
   - `Curated Full Level`: full treasure-by-level package for the party’s current average level.
   - `One Relevant Permanent`: one useful permanent item only.

## Macro/API examples

```js
const loot = game.actors.getName("Session Loot");
await game.pf2eCuratedAutoloot.rollSessionTreasure(loot);
```

```js
const loot = canvas.tokens.controlled[0]?.actor;
await game.pf2eCuratedAutoloot.rollOnePermanent(loot);
```

```js
console.log(game.pf2eCuratedAutoloot.getSessionParty());
```

## Settings added

- `Enable curated loot generator`: toggles the overlay.
- `Session party actor folder`: default `Party`.
- `Session treasure fraction`: default `0.25`; this is the currency fraction for session-sized rewards.
- `Party relevance weight`: default `3`; higher values make party-specific scoring more dominant.
- `Junk loot name regex`: editable regex for names that should be converted away from item picks.

## Curated filtering model

The generator considers permanent items useful when they are magical, invested, rune-related, tradition-related, or match common useful item names like staves, wands, spellhearts, rings, boots, gloves, cloaks, wayfinders, and skill boosters. Plain mundane weapons/armor/shields are rejected unless they have magic/rune/useful traits.

Consumables are kept when they are likely to be used: potions, elixirs, scrolls, oils, talismans, fulus, mutagens, bombs, antidotes, antiplagues, catalysts, and similar items. Poisons are down-filtered unless the party includes a rogue, alchemist, or similar profile.

Junk/trade-good names such as coffee, beans, coal, flour, grain, soap, chalk, rope, lumber, ore, hides, livestock, barrels, crates, buckets, and tools are rejected by default and represented as currency instead.

## Party-aware scoring

The scoring pass extracts class and tradition hints from the actors in the `Party` folder. It then weights item names, traits, and categories against profiles for classes like fighter, rogue, cleric, psychic, wizard, alchemist, kineticist, champion, ranger, magus, bard, etc. General items remain eligible so loot does not become too narrow.

Examples:

- A psychic increases the score for occult, mental, illusion, dream, wand, scroll, and staff items.
- A sword-and-board champion increases armor, shield, reinforcing, resilient, divine, healing, and rune scores.
- A rogue increases thievery, stealth, deception, finesse-ish weapon, cloak, boots, and tool scores.
- Alchemists make bombs, elixirs, mutagens, and alchemical tools much more likely.

## Known limitations

- This is an additive overlay. It does not yet replace the original container auto-roll path.
- It is syntax-checked with Node, but it still needs Foundry runtime testing in your world.
- The class profiles are heuristic and should be tuned from real session results.
- Foundry/PF2e data paths can shift between system versions; the code uses defensive fallbacks, but runtime testing is still required.

## Recommended next phase

After you test the overlay, the clean architectural next step is to fold the curated filter/scorer into the existing `generateStash` and normal Roll Loot workflow. That should add a setting like `Loot mode: Original / Curated / Hybrid`, so barrels and crates can stay low-value while stashes and session reward chests use the new curated logic.
