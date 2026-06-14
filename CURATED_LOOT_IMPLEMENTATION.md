# PF2e Curated Autoloot Overlay

This overlay adds a curated, party-aware generator on top of the existing PF2e Autoloot module.

## Latest hotfix notes

- Uses the module's existing PF2e party resolution path first.
- Excludes familiars, animal companions, and master-linked companion actors from party size, average level, and class weighting.
- Removes the old body/sidebar button injection that created oversized card-like buttons in PF2e loot sheets.
- Adds a duplicate header-button guard so the header controls are not added twice if the script is accidentally loaded twice.
- Excludes 0 gp / no-price equipment from curated random loot.
- Excludes rare and unique random loot by default. Rare can be re-enabled with the module setting **Allow rare random loot**, but unique remains blocked.
- Blocks quest-like item names/traits such as contract, pact, boon, curse, artifact, relic, story, and quest.
- Session loot now samples a proportional slice of the PF2e Treasure by Level item-slot plan instead of hard-coding exactly one permanent item.
- Party size affects session item counts through stochastic rounding: at the default 0.25 session fraction, a 5-PC party has a 25% chance of a second permanent item.
- Permanent item slots have a configurable chance to roll one level above the normal slot, capped at party level +2 and budget-filtered.
- Item picks use a soft budget cap with configurable slack; currency is reduced if the selected items consume the session budget.

## Main buttons

- **Session Treasure**: default Woop Woop session reward.
- **Curated Full Level**: full-level treasure package.
- **One Permanent**: one spotlight-biased permanent item.

## Install

Copy `scripts/pf2e-curated-loot.js` into your module's `scripts/` folder and make sure `module.json` includes it after `scripts/pf2e-autoloot.js`:

```json
"esmodules": [
  "scripts/pf2e-autoloot.js",
  "scripts/pf2e-curated-loot.js",
  "scripts/option-menu.js",
  "scripts/custom-containter.js",
  "vendor/tagify/tagify.js"
]
```

After updating, restart Foundry or hard-refresh the browser client. If the big card buttons remain, your world is still loading an old copy of the script or the script is listed more than once in `module.json`.
