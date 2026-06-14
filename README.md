# PF2e Curated Autoloot

PF2e Curated Autoloot is a Foundry VTT module fork focused on generating Pathfinder 2e treasure that players are more likely to keep, use, and care about.

It keeps the original auto-loot/container workflow from PF2e Autoloot, then adds a curated, party-aware treasure generator for campaigns where random clutter is less useful than level-appropriate magic items, consumables, and currency.

## What this fork is for

This fork is designed for GMs who want PF2e treasure to stay close to the official Treasure by Level guidance while avoiding results like mundane trade goods, junk loot, 0 gp story records, or niche quest items in random chests.

The main goals are:

* Replace clutter with useful treasure or currency.
* Preserve PF2e-style level-based treasure distribution.
* Generate useful permanent magic items and consumables each session.
* Weight loot toward the current party without making every item perfectly tailored.
* Respect party size, especially rotating West Marches-style groups.
* Exclude familiars and animal companions from party size and class weighting.
* Keep rarity meaningful: common items are most likely, uncommon items are less likely, rare items are possible but much less likely, and unique items are blocked.

## Installation

Install from the latest release manifest:

```text
https://github.com/rqueensen/pf2e-curated-autoloot/releases/latest/download/module.json
```

Or install manually by placing the module folder in your Foundry user data directory:

```text
Data/modules/pf2e-curated-autoloot
```

Then enable **PF2e Curated Autoloot** in your world's module settings.

## Main buttons

Curated loot generation is available from loot actor sheet header buttons.

### Session Treasure

Use this for normal session rewards.

It takes a configurable fraction of one level's treasure budget, then generates a useful mix of permanent items, consumables, and currency. By default, the session fraction is `0.25`, which roughly models four treasure payouts per level.

### Curated Full Level

Use this when preparing a full level's worth of treasure, a larger dungeon, or a major hex-crawl region.

This mode follows the PF2e Treasure by Level slot structure more strictly. It uses the party's average level, adds extra treasure for parties larger than four, and keeps full-level item slots at their intended levels rather than using above-table upgrades.

### One Relevant Permanent

Use this when you want one good permanent item for a boss, quest reward, notable chest, or manual treasure placement.

This mode intentionally favors the spotlight/party-aware selection path, so it is more likely to produce something relevant to one of the current PCs.

## How curated selection works

The generator uses a hybrid selection model:

```text
70% general useful loot
20% party-weighted loot
10% spotlight loot for one random PC/class
```

General useful loot includes broadly useful items such as healing potions, elixirs of life, antidotes, antiplagues, antivenoms, spacious pouches, boots, cloaks, gloves, belts, rings, goggles, and similar utility items.

Party-weighted loot is scored using the current party's class and role profile. Duplicate roles count, so a party with three martial PCs weights martial treasure more strongly than a party with only one martial PC.

Spotlight loot picks one current PC and favors that character's class profile. This creates occasional rewards that feel personally relevant without making every treasure drop custom-built for a single character.

## Roll audit

Curated loot chat output includes a collapsed **Roll audit** section.

The audit logs rolls and weighting decisions such as:

* Session slot rounding
* Extra-PC item level rolls
* Above-table item level rolls
* 70/20/10 lane rolls
* Spotlight PC selection
* Weighted item selection
* Rarity multipliers
* Specific scroll spell selection
* Currency/budget adjustments

## Credits

This is a fork of PF2e Autoloot by ZzinnerGamer.

Curated treasure logic is guided by Pathfinder 2e Treasure by Level expectations and the practical goal of giving players items they are likely to use rather than random clutter.

Thanks to the Foundry VTT and PF2e system communities for the compendium data, APIs, and ecosystem that make this kind of module possible.
