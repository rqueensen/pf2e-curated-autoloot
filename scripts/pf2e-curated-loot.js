/*
 * PF2e Curated Autoloot extension
 *
 * Add this file to module.json esmodules after scripts/pf2e-autoloot.js.
 * This file is intentionally additive: it keeps the original module's roll-loot
 * path intact and adds curated, party-aware treasure buttons/API.
 */

const MODULE = "pf2e-autoloot";
const API_NAME = "pf2eCuratedAutoloot";

const TREASURE_BY_LEVEL = {
  1: { total: 175, permanent: { 2: 2, 1: 2 }, consumable: { 2: 2, 1: 3 }, currency: 40, extraPc: 10 },
  2: { total: 300, permanent: { 3: 2, 2: 2 }, consumable: { 3: 2, 2: 2, 1: 2 }, currency: 70, extraPc: 18 },
  3: { total: 500, permanent: { 4: 2, 3: 2 }, consumable: { 4: 2, 3: 2, 2: 2 }, currency: 120, extraPc: 30 },
  4: { total: 850, permanent: { 5: 2, 4: 2 }, consumable: { 5: 2, 4: 2, 3: 2 }, currency: 200, extraPc: 50 },
  5: { total: 1350, permanent: { 6: 2, 5: 2 }, consumable: { 6: 2, 5: 2, 4: 2 }, currency: 320, extraPc: 80 },
  6: { total: 2000, permanent: { 7: 2, 6: 2 }, consumable: { 7: 2, 6: 2, 5: 2 }, currency: 500, extraPc: 125 },
  7: { total: 2900, permanent: { 8: 2, 7: 2 }, consumable: { 8: 2, 7: 2, 6: 2 }, currency: 720, extraPc: 180 },
  8: { total: 4000, permanent: { 9: 2, 8: 2 }, consumable: { 9: 2, 8: 2, 7: 2 }, currency: 1000, extraPc: 250 },
  9: { total: 5700, permanent: { 10: 2, 9: 2 }, consumable: { 10: 2, 9: 2, 8: 2 }, currency: 1400, extraPc: 350 },
  10: { total: 8000, permanent: { 11: 2, 10: 2 }, consumable: { 11: 2, 10: 2, 9: 2 }, currency: 2000, extraPc: 500 },
  11: { total: 11500, permanent: { 12: 2, 11: 2 }, consumable: { 12: 2, 11: 2, 10: 2 }, currency: 2800, extraPc: 700 },
  12: { total: 16500, permanent: { 13: 2, 12: 2 }, consumable: { 13: 2, 12: 2, 11: 2 }, currency: 4000, extraPc: 1000 },
  13: { total: 25000, permanent: { 14: 2, 13: 2 }, consumable: { 14: 2, 13: 2, 12: 2 }, currency: 6000, extraPc: 1500 },
  14: { total: 36500, permanent: { 15: 2, 14: 2 }, consumable: { 15: 2, 14: 2, 13: 2 }, currency: 9000, extraPc: 2250 },
  15: { total: 54500, permanent: { 16: 2, 15: 2 }, consumable: { 16: 2, 15: 2, 14: 2 }, currency: 13000, extraPc: 3250 },
  16: { total: 82500, permanent: { 17: 2, 16: 2 }, consumable: { 17: 2, 16: 2, 15: 2 }, currency: 20000, extraPc: 5000 },
  17: { total: 128000, permanent: { 18: 2, 17: 2 }, consumable: { 18: 2, 17: 2, 16: 2 }, currency: 30000, extraPc: 7500 },
  18: { total: 208000, permanent: { 19: 2, 18: 2 }, consumable: { 19: 2, 18: 2, 17: 2 }, currency: 48000, extraPc: 12000 },
  19: { total: 355000, permanent: { 20: 2, 19: 2 }, consumable: { 20: 2, 19: 2, 18: 2 }, currency: 80000, extraPc: 20000 },
  20: { total: 490000, permanent: { 20: 4 }, consumable: { 20: 4, 19: 2 }, currency: 140000, extraPc: 35000 },
};

const DEFAULT_JUNK_REGEX = [
  "coffee", "beans?", "coal", "flour", "grain", "wheat", "corn", "oats?",
  "rations?", "jerky", "cheese", "soap", "chalk", "candle", "rope", "twine",
  "lumber", "timber", "ore", "ingot", "hide", "pelt", "cloth", "textile",
  "bottle", "jug", "mug", "plate", "cup", "fork", "spoon", "broom", "bucket",
  "ladder", "pole", "tent", "bedroll", "backpack", "sack", "satchel", "barrel",
  "crate", "chest", "artisan", "trade good", "livestock", "feed", "hay"
].join("|");

const STORY_OR_NO_RANDOM_REGEX = [
  "devil'?s contract", "devil'?s luck", "contract", "pact", "boon", "curse", "cursed",
  "artifact", "relic", "story", "quest", "favor", "blessing", "unique", "campaign"
].join("|");

const GENERAL_PERMANENT_KEYWORDS = [
  "spacious pouch", "bag of holding", "cloak", "boots", "gloves", "gauntlets", "goggles",
  "lenses", "bracers", "ring", "amulet", "pendant", "belt", "headband", "hat", "mask",
  "wayfinder", "scroll belt"
];

const CASTER_PERMANENT_KEYWORDS = [
  "staff", "wand", "spellheart", "grimoire", "spellbook", "robe", "crown", "diadem", "focus"
];

const MARTIAL_PERMANENT_KEYWORDS = [
  "rune", "weapon potency", "striking", "resilient", "reinforcing", "property rune",
  "armor", "shield", "buckler", "handwraps"
];

const GENERAL_CONSUMABLE_KEYWORDS = [
  "healing potion", "elixir of life", "potion", "elixir", "antidote", "antiplague",
  "antivenom", "darkvision", "invisibility", "healing", "resistance", "snapleaf"
];

const CASTER_CONSUMABLE_KEYWORDS = [
  "scroll", "catalyst", "spell catalyst", "chaos falcon feather", "kirin echo chime", "fulu"
];

const MARTIAL_CONSUMABLE_KEYWORDS = [
  "oil", "talisman", "ammunition", "arrow", "bolt", "throwing", "weapon", "armor"
];

const ALCHEMICAL_CONSUMABLE_KEYWORDS = [
  "bomb", "mutagen", "poison", "drug", "alchemical", "snare"
];

const ROLE_KEYWORDS = {
  martial: ["rune", "weapon", "striking", "potency", "armor", "shield", "buckler", "talisman", "oil", "handwraps"],
  caster: ["staff", "wand", "scroll", "spellheart", "grimoire", "spellbook", "robe", "ring", "focus", "catalyst", "fulu"],
  alchemical: ["alchemical", "elixir", "bomb", "mutagen", "antidote", "antiplague", "poison", "drug", "goggles"],
  shield: ["shield", "reinforcing", "buckler"],
  armor: ["armor", "resilient", "fortification", "shadow", "slick"],
  weapon: ["weapon", "striking", "potency", "rune"],
  ranged: ["bow", "crossbow", "ammunition", "arrow", "bolt", "scope", "thrower"],
  skill: ["thievery", "stealth", "diplomacy", "deception", "intimidation", "medicine", "occultism", "arcana", "nature", "religion", "society", "survival", "athletics", "acrobatics", "performance", "crafting"],
  occult: ["occult", "mental", "emotion", "illusion", "dream", "fear"],
  divine: ["divine", "healing", "vitality", "holy", "spirit", "religion", "sanctified"],
  primal: ["primal", "nature", "healing", "animal", "plant", "wood", "fire", "water", "earth", "air"],
  arcane: ["arcane", "evocation", "illusion", "transmutation", "abjuration", "spellheart"],
  crafting: ["crafting", "tools", "formula", "snare", "gadget"],
};

const CLASS_PROFILES = {
  alchemist: { roles: ["alchemical", "skill", "crafting"], any: ["elixir", "bomb", "mutagen", "alchemical", "formula", "goggles", "tools", "healing"] },
  animist: { roles: ["caster", "divine", "primal"], any: ["staff", "wand", "scroll", "healing", "spirit", "vitality", "divine", "primal", "religion", "nature"] },
  barbarian: { roles: ["martial", "weapon"], any: ["rune", "weapon", "striking", "potency", "boots", "belt", "bracers", "talisman", "healing"] },
  bard: { roles: ["caster", "occult", "skill"], any: ["staff", "wand", "scroll", "occult", "performance", "diplomacy", "deception", "mental", "sonic"] },
  champion: { roles: ["martial", "divine", "armor", "shield"], any: ["armor", "shield", "reinforcing", "resilient", "healing", "divine", "talisman", "rune"] },
  cleric: { roles: ["caster", "divine"], any: ["staff", "wand", "scroll", "healing", "vitality", "divine", "religion", "holy"] },
  druid: { roles: ["caster", "primal"], any: ["staff", "wand", "scroll", "primal", "nature", "healing", "animal", "plant", "wood"] },
  fighter: { roles: ["martial", "weapon", "armor", "shield"], any: ["rune", "weapon", "striking", "potency", "armor", "shield", "reinforcing", "talisman"] },
  gunslinger: { roles: ["martial", "ranged", "skill"], any: ["rune", "weapon", "ammunition", "scope", "goggles", "talisman", "stealth", "acrobatics"] },
  inventor: { roles: ["martial", "crafting", "skill"], any: ["rune", "weapon", "armor", "crafting", "tools", "goggles", "clockwork", "gadget"] },
  investigator: { roles: ["skill", "ranged"], any: ["perception", "society", "medicine", "thievery", "stealth", "goggles", "lens", "tools", "elixir"] },
  kineticist: { roles: ["impulse"], any: ["gate", "elemental", "fire", "water", "earth", "air", "wood", "metal", "healing", "talisman"] },
  magus: { roles: ["martial", "caster", "arcane", "weapon"], any: ["rune", "weapon", "striking", "wand", "scroll", "arcane", "spellheart", "talisman"] },
  monk: { roles: ["martial", "weapon"], any: ["handwraps", "rune", "boots", "bracers", "belt", "acrobatic", "athletics", "talisman"] },
  oracle: { roles: ["caster", "divine"], any: ["staff", "wand", "scroll", "divine", "healing", "curse", "religion", "vitality"] },
  psychic: { roles: ["caster", "occult"], any: ["staff", "wand", "scroll", "occult", "mental", "illusion", "dream", "emotion", "deception"] },
  ranger: { roles: ["martial", "ranged", "primal", "skill"], any: ["rune", "weapon", "bow", "crossbow", "boots", "cloak", "survival", "nature", "primal", "snare"] },
  rogue: { roles: ["martial", "skill"], any: ["rune", "weapon", "dagger", "shortsword", "thievery", "stealth", "deception", "boots", "cloak", "tools", "poison"] },
  sorcerer: { roles: ["caster"], any: ["staff", "wand", "scroll", "spellheart", "robe", "ring", "amulet", "arcane", "divine", "occult", "primal"] },
  summoner: { roles: ["caster"], any: ["staff", "wand", "scroll", "eidolon", "spellheart", "talisman"] },
  swashbuckler: { roles: ["martial", "skill", "weapon"], any: ["rune", "weapon", "rapier", "buckler", "acrobatics", "athletics", "deception", "diplomacy", "talisman"] },
  thaumaturge: { roles: ["martial", "skill"], any: ["rune", "weapon", "esoterica", "occult", "religion", "talisman", "amulet", "implement", "scroll"] },
  witch: { roles: ["caster"], any: ["staff", "wand", "scroll", "familiar", "grimoire", "hex", "arcane", "divine", "occult", "primal"] },
  wizard: { roles: ["caster", "arcane"], any: ["staff", "wand", "scroll", "arcane", "grimoire", "spellbook", "robe", "crown", "ring"] },
};

const SCROLL_ITEM_LEVEL_BY_RANK = { 1: 1, 2: 3, 3: 5, 4: 7, 5: 9, 6: 11, 7: 13, 8: 15, 9: 17, 10: 19 };
const SCROLL_PRICE_BY_RANK = { 1: 4, 2: 12, 3: 30, 4: 70, 5: 150, 6: 300, 7: 600, 8: 1300, 9: 3000, 10: 8000 };

const CURRENCY_KEYS = ["pp", "gp", "sp", "cp", "credits", "upb"];

function readCurrencyNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") return Number(value) || 0;
  if (value && typeof value === "object" && !Array.isArray(value) && "value" in value) return Number(value.value) || 0;
  return Number(value) || 0;
}

function writeCurrencyLike(existingValue, amount) {
  if (existingValue && typeof existingValue === "object" && !Array.isArray(existingValue) && "value" in existingValue) {
    return { ...existingValue, value: amount };
  }
  return amount;
}

function hasAnyCurrencyObj(obj) {
  if (!obj || typeof obj !== "object") return false;
  return CURRENCY_KEYS.some(key => readCurrencyNumber(obj[key]) > 0);
}

function mergeCurrency(existingCurrency, addedCurrency) {
  const base = existingCurrency && typeof existingCurrency === "object" ? foundry.utils.deepClone(existingCurrency) : {};
  const added = addedCurrency && typeof addedCurrency === "object" ? addedCurrency : {};
  const out = { ...base };
  for (const key of CURRENCY_KEYS) {
    if (!(key in added) && !(key in base)) continue;
    const next = readCurrencyNumber(base[key]) + readCurrencyNumber(added[key]);
    out[key] = writeCurrencyLike(base[key], next);
  }
  return out;
}

const cache = {
  ready: false,
  entries: [],
  docs: new Map(),
  spellsReady: false,
  spellEntries: [],
  spellDocs: new Map(),
};

Hooks.once("init", () => {
  registerCuratedSetting("curatedEnabled", {
    name: "Enable curated loot generator",
    hint: "Adds curated/session loot buttons and the curated API.",
    type: Boolean,
    default: true,
  });

  registerCuratedSetting("curatedPartyFolder", {
    name: "Fallback session party actor folder",
    hint: "Fallback only. The PF2e party actor is checked first, then scene/player-owned actors, then this Actor folder.",
    type: String,
    default: "Party",
  });

  registerCuratedSetting("curatedSessionFraction", {
    name: "Session treasure fraction",
    hint: "Fraction of one level's treasure used by Session Treasure.",
    type: Number,
    default: 0.25,
    range: { min: 0.05, max: 1, step: 0.05 },
  });

  registerCuratedSetting("curatedPartyWeight", {
    name: "Party relevance weight",
    hint: "Higher values make class/role matching dominate general item quality.",
    type: Number,
    default: 3,
    range: { min: 0, max: 10, step: 1 },
  });

  registerCuratedSetting("curatedJunkNameRegex", {
    name: "Junk name blocklist regex",
    hint: "Matching items are excluded from curated generation. Their value is represented as currency instead.",
    type: String,
    default: DEFAULT_JUNK_REGEX,
  });

  registerCuratedSetting("curatedBudgetSlack", {
    name: "Budget slack",
    hint: "Soft budget multiplier. 1.15 allows generated item value plus currency to run about 15% over the approximate treasure budget.",
    type: Number,
    default: 1.15,
    range: { min: 1, max: 2, step: 0.05 },
  });

  registerCuratedSetting("curatedAboveTableChance", {
    name: "Above-table permanent chance",
    hint: "Session/one-permanent rolls can occasionally shift a permanent item one level higher, capped at party level +2. Full-level generation stays table-accurate.",
    type: Number,
    default: 0.15,
    range: { min: 0, max: 0.5, step: 0.01 },
  });

  registerCuratedSetting("curatedUncommonWeight", {
    name: "Uncommon item weight",
    hint: "Multiplier applied to uncommon items during weighted selection. Common is 1.0.",
    type: Number,
    default: 0.45,
    range: { min: 0, max: 1, step: 0.01 },
  });

  registerCuratedSetting("curatedRareWeight", {
    name: "Rare item weight",
    hint: "Multiplier applied to rare items during weighted selection. Rare items are allowed, but should be much less common than uncommon.",
    type: Number,
    default: 0.12,
    range: { min: 0, max: 1, step: 0.01 },
  });

  registerCuratedSetting("curatedSpecificScrolls", {
    name: "Generate specific spell scrolls",
    hint: "Replaces generic scroll items with a party-appropriate spell scroll when the PF2e spells compendium is available.",
    type: Boolean,
    default: true,
  });
});

Hooks.once("ready", () => {
  globalThis[API_NAME] = {
    rollSessionTreasure: (actor) => safeGenerateCuratedLoot(actor, { mode: "session" }),
    rollFullLevelTreasure: (actor) => safeGenerateCuratedLoot(actor, { mode: "full-level" }),
    rollOnePermanent: (actor) => safeGenerateCuratedLoot(actor, { mode: "one-permanent" }),
    getSessionParty,
    resolveSessionParty,
    partyContext,
    preload: preloadCuratedIndex,
    scoreEntry,
    audienceForEntry,
  };
});

Hooks.on("getActorSheetHeaderButtons", (app, buttons) => {
  try {
    if (!game.settings.get(MODULE, "curatedEnabled")) return;
    const actor = app?.actor;
    if (!isLootActor(actor)) return;

    const addOnce = (button) => {
      if (!buttons.some(b => b.class === button.class)) buttons.unshift(button);
    };

    addOnce({
      label: "One Relevant Permanent",
      class: "pf2e-curated-one-permanent",
      icon: "fas fa-hat-wizard",
      onclick: () => safeGenerateCuratedLoot(actor, { mode: "one-permanent" }),
    });
    addOnce({
      label: "Session Treasure",
      class: "pf2e-curated-session-treasure",
      icon: "fas fa-gem",
      onclick: () => safeGenerateCuratedLoot(actor, { mode: "session" }),
    });
    addOnce({
      label: "Curated Full Level",
      class: "pf2e-curated-full-treasure",
      icon: "fas fa-wand-magic-sparkles",
      onclick: () => safeGenerateCuratedLoot(actor, { mode: "full-level" }),
    });
  } catch (error) {
    console.warn(`${MODULE}: failed to add curated header buttons`, error);
  }
});

function registerCuratedSetting(key, data) {
  game.settings.register(MODULE, key, {
    scope: "world",
    config: true,
    ...data,
  });
}

function isLootActor(actor) {
  return actor?.type === "loot" || actor?.type === "party" || actor?.system?.lootSheetType;
}

function clampLevel(level) {
  const numeric = Number(level) || 1;
  return Math.max(1, Math.min(20, Math.round(numeric)));
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (value instanceof Set) return [...value];
  if (value instanceof Map) return [...value.values()];
  if (typeof value === "object") return Object.values(value);
  return [value];
}

function counterAdd(counter, key, amount = 1) {
  if (!key) return;
  counter.set(key, (counter.get(key) ?? 0) + amount);
}

function counterHas(counter, key) {
  return (counter.get(key) ?? 0) > 0;
}

function counterSummary(counter) {
  return [...counter.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function traitList(entryOrItem) {
  const system = entryOrItem?.system ?? {};
  const traits = system.traits ?? {};
  return [
    ...toArray(traits.value),
    ...toArray(traits.otherTags),
    traits.rarity,
    system.category,
    system.category?.value,
    system.consumableType?.value,
    system.usage?.value,
    system.group,
    system.group?.value,
    system.baseItem,
    system.baseItem?.value,
    system.preciousMaterial?.value,
  ].filter(Boolean).map(v => String(v).toLowerCase());
}

function textBlob(entryOrItem) {
  const traits = traitList(entryOrItem).join(" ");
  return `${entryOrItem?.name ?? ""} ${entryOrItem?.type ?? ""} ${traits}`.toLowerCase();
}

function entryLevel(entry) {
  return clampLevel(entry?.system?.level?.value ?? entry?.system?.level ?? 0);
}

function priceToGP(itemOrEntry) {
  const price = itemOrEntry?.system?.price ?? {};
  const value = price.value ?? price;
  let gp = 0;
  if (typeof value === "number") gp = value;
  else if (typeof value === "string") gp = Number(value.replace(/[^0-9.]/g, "")) || 0;
  else if (value && typeof value === "object") {
    gp += Number(value.pp ?? 0) * 10;
    gp += Number(value.gp ?? 0);
    gp += Number(value.sp ?? 0) / 10;
    gp += Number(value.cp ?? 0) / 100;
  }
  if (typeof price.per === "number" && price.per > 1) gp /= price.per;
  return Number.isFinite(gp) ? Math.max(0, gp) : 0;
}


function setItemQuantity(raw, quantity = 1) {
  raw.system = raw.system ?? {};
  const current = raw.system.quantity;

  // Preserve the PF2e system's source-data shape. Different PF2e versions and
  // item types have used either `quantity: 1` or `quantity: { value: 1 }`.
  // Forcing either shape can break item creation in the other schema.
  if (current && typeof current === "object" && !Array.isArray(current) && Object.prototype.hasOwnProperty.call(current, "value")) {
    raw.system.quantity = { ...current, value: quantity };
  } else if (typeof current === "number") {
    raw.system.quantity = quantity;
  } else if (current == null) {
    // Most compendium physical items already carry quantity. If this item does
    // not, let the PF2e schema apply its default instead of guessing a shape.
    delete raw.system.quantity;
  } else {
    raw.system.quantity = current;
  }
}

function setLevelValue(raw, level) {
  raw.system = raw.system ?? {};
  const current = raw.system.level;
  const numeric = clampLevel(level);
  if (current && typeof current === "object" && !Array.isArray(current) && Object.prototype.hasOwnProperty.call(current, "value")) {
    raw.system.level = { ...current, value: numeric };
  } else if (typeof current === "number") {
    raw.system.level = numeric;
  } else if (current == null) {
    raw.system.level = { value: numeric };
  } else {
    raw.system.level = current;
  }
}

function itemRarity(entryOrItem) {
  const traits = entryOrItem?.system?.traits ?? {};
  const fromField = traits.rarity ? String(traits.rarity).toLowerCase() : null;
  if (fromField) return fromField;
  const list = traitList(entryOrItem);
  if (list.includes("unique")) return "unique";
  if (list.includes("rare")) return "rare";
  if (list.includes("uncommon")) return "uncommon";
  return "common";
}

function rarityMultiplier(entry) {
  const rarity = itemRarity(entry);
  if (rarity === "unique") return 0;
  if (rarity === "rare") return Math.max(0, Number(game.settings.get(MODULE, "curatedRareWeight")) || 0);
  if (rarity === "uncommon") return Math.max(0, Number(game.settings.get(MODULE, "curatedUncommonWeight")) || 0);
  return 1;
}

function resolveSessionParty() {
  const ignored = [];
  const clean = (actors) => {
    const seen = new Set();
    const pcs = [];
    for (const actor of actors.filter(Boolean)) {
      if (seen.has(actor.uuid ?? actor.id)) continue;
      seen.add(actor.uuid ?? actor.id);
      const reason = nonPcReason(actor);
      if (reason) ignored.push({ actor, reason });
      else pcs.push(actor);
    }
    return pcs;
  };

  const partyActor = game.actors?.party ?? game.actors?.find?.(a => a.type === "party");
  const partyMembers = getPartyActorMembers(partyActor);
  let actors = clean(partyMembers);
  if (actors.length) return { source: "PF2e party actor", actors, ignored };

  if (globalThis.canvas?.ready) {
    actors = clean(canvas.tokens.placeables.map(t => t.actor).filter(a => a?.hasPlayerOwner));
    if (actors.length) return { source: "active scene player-owned tokens", actors, ignored };
  }

  actors = clean(game.actors.filter(a => a?.type === "character" && a.hasPlayerOwner));
  if (actors.length) return { source: "player-owned character actors", actors, ignored };

  const folderActors = getFallbackFolderActors();
  actors = clean(folderActors);
  if (actors.length) return { source: "fallback Party actor folder", actors, ignored };

  return { source: "fallback default", actors: [], ignored };
}

function getSessionParty() {
  return resolveSessionParty().actors;
}

function getPartyActorMembers(partyActor) {
  if (!partyActor) return [];
  const members = [];
  for (const value of toArray(partyActor.members)) members.push(value?.actor ?? value);
  const memberIds = toArray(partyActor.system?.details?.members).map(m => m?.uuid ?? m?.id ?? m).filter(Boolean);
  for (const id of memberIds) {
    const actor = game.actors.get(id) ?? fromUuidSyncSafe(id);
    if (actor) members.push(actor);
  }
  return members;
}

function fromUuidSyncSafe(uuid) {
  try {
    return typeof fromUuidSync === "function" ? fromUuidSync(uuid) : null;
  } catch (_error) {
    return null;
  }
}

function getFallbackFolderActors() {
  const folderName = game.settings.get(MODULE, "curatedPartyFolder") || "Party";
  const folders = Array.from(game.folders ?? []);
  const root = folders.find(f => f?.type === "Actor" && f.name === folderName);
  if (!root) return [];
  const folderIds = new Set([root.id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const folder of folders) {
      const parentId = folder?.folder?.id ?? folder?.parent?.id ?? folder?.parentFolder?.id;
      if (folder?.type === "Actor" && parentId && folderIds.has(parentId) && !folderIds.has(folder.id)) {
        folderIds.add(folder.id);
        changed = true;
      }
    }
  }
  return game.actors.filter(a => folderIds.has(a.folder?.id));
}

function nonPcReason(actor) {
  if (!actor) return "missing actor";
  if (actor.type === "familiar") return "actor type familiar";
  if (["animal-companion", "companion", "eidolon"].includes(actor.type)) return `actor type ${actor.type}`;
  const master = actor.system?.master;
  if (master?.id || master?.uuid || master?.actor) return "has PF2e master link";
  const classSlug = actorClassSlug(actor);
  const hasClassItem = Boolean(classSlug);
  const creatureValue = actor.system?.details?.creature?.value;
  if (actor.type !== "character") return `actor type ${actor.type}`;
  if (!hasClassItem && creatureValue) return "classless creature-like character actor";
  const itemBlobs = Array.from(actor.items ?? []).map(i => `${i.type} ${i.name ?? ""} ${i.system?.category ?? ""} ${i.system?.category?.value ?? ""} ${i.system?.slug ?? ""}`.toLowerCase()).join(" ");
  if (!hasClassItem && /familiar|animal companion|companion/.test(itemBlobs)) return "classless familiar/companion abilities";
  return null;
}

function actorClassSlug(actor) {
  const classItem = actor?.itemTypes?.class?.[0] ?? Array.from(actor?.items ?? []).find(i => i.type === "class");
  return slugify(classItem?.slug ?? classItem?.name ?? actor?.class?.slug ?? actor?.system?.details?.class?.value);
}

function partyContext() {
  const resolution = resolveSessionParty();
  const actors = resolution.actors;
  const levels = actors.map(a => Number(a.system?.details?.level?.value ?? 1)).filter(n => Number.isFinite(n) && n > 0);
  const level = clampLevel(levels.length ? levels.reduce((a, b) => a + b, 0) / levels.length : 1);
  const classes = [];
  const classCounts = new Map();
  const roles = new Map();
  const keywords = new Map();
  const traditions = new Map();
  const actorProfiles = [];

  for (const actor of actors) {
    const cls = actorClassSlug(actor);
    if (cls) {
      classes.push(cls);
      counterAdd(classCounts, cls);
      applyClassProfile(cls, roles, keywords, 1);
    }

    for (const item of actor.items ?? []) {
      if (item?.type === "spellcastingEntry") {
        const tradition = item.system?.tradition?.value;
        if (tradition) {
          const slug = String(tradition).toLowerCase();
          counterAdd(traditions, slug);
          counterAdd(roles, slug);
          counterAdd(roles, "caster");
        }
      }
    }

    actorProfiles.push({ actor, classSlug: cls, profile: CLASS_PROFILES[cls] ?? null, traditions: actorTraditions(actor) });
  }

  return {
    resolution,
    actors,
    level,
    partySize: actors.length || 4,
    classes,
    classCounts,
    roles,
    keywords,
    traditions,
    actorProfiles,
  };
}

function applyClassProfile(classSlug, roles, keywords, amount = 1) {
  const profile = CLASS_PROFILES[classSlug];
  if (!profile) return;
  for (const role of profile.roles ?? []) counterAdd(roles, role, amount);
  for (const word of profile.any ?? []) counterAdd(keywords, word, amount);
}

function actorTraditions(actor) {
  const traditions = new Set();
  for (const item of actor.items ?? []) {
    if (item?.type === "spellcastingEntry") {
      const tradition = item.system?.tradition?.value;
      if (tradition) traditions.add(String(tradition).toLowerCase());
    }
  }
  return traditions;
}

function selectionPlan(ctx, mode) {
  const spec = TREASURE_BY_LEVEL[ctx.level] ?? TREASURE_BY_LEVEL[1];
  const extraPcs = Math.max(0, ctx.partySize - 4);
  const fraction = Math.max(0.05, Math.min(1, Number(game.settings.get(MODULE, "curatedSessionFraction")) || 0.25));

  if (mode === "one-permanent") {
    const bumped = Math.random() < (Number(game.settings.get(MODULE, "curatedAboveTableChance")) || 0);
    return {
      permanent: [{ targetLevel: Math.min(20, ctx.level + (bumped ? 2 : 1)), count: 1, source: bumped ? "spotlight above-table" : "spotlight" }],
      consumable: [],
      currency: 0,
      budget: estimatePlanBudget(ctx.level, [{ targetLevel: Math.min(20, ctx.level + (bumped ? 2 : 1)), count: 1 }], [], 0),
      exactLevels: false,
    };
  }

  if (mode === "full-level") {
    const permanent = objectSlots(spec.permanent).map(s => ({ ...s, source: "table" }));
    const consumable = objectSlots(spec.consumable).map(s => ({ ...s, source: "table" }));
    for (let i = 0; i < extraPcs; i++) {
      permanent.push({ targetLevel: Math.min(20, ctx.level + (Math.random() < 0.5 ? 1 : 0)), count: 1, source: "extra PC" });
      consumable.push({ targetLevel: Math.min(20, ctx.level + 1), count: 1, source: "extra PC" }, { targetLevel: ctx.level, count: 1, source: "extra PC" });
    }
    return {
      permanent,
      consumable,
      currency: spec.currency + (extraPcs * spec.extraPc),
      budget: spec.total + estimatePlanBudget(ctx.level, permanent.filter(s => s.source === "extra PC"), consumable.filter(s => s.source === "extra PC"), extraPcs * spec.extraPc),
      exactLevels: true,
    };
  }

  const fullPermanent = objectSlots(spec.permanent);
  const fullConsumable = objectSlots(spec.consumable);
  for (let i = 0; i < extraPcs; i++) {
    fullPermanent.push({ targetLevel: Math.min(20, ctx.level + (Math.random() < 0.5 ? 1 : 0)), count: 1 });
    fullConsumable.push({ targetLevel: Math.min(20, ctx.level + 1), count: 1 }, { targetLevel: ctx.level, count: 1 });
  }

  const permanent = fractionalSlots(fullPermanent, fraction).map(s => ({ ...s, source: "session slice" }));
  const consumable = fractionalSlots(fullConsumable, fraction).map(s => ({ ...s, source: "session slice" }));

  if (!permanent.length) permanent.push({ targetLevel: Math.min(20, ctx.level + 1), count: 1, source: "session minimum" });
  if (Math.random() < (Number(game.settings.get(MODULE, "curatedAboveTableChance")) || 0)) {
    const slot = permanent[Math.floor(Math.random() * permanent.length)];
    slot.targetLevel = Math.min(20, ctx.level + 2, slot.targetLevel + 1);
    slot.source = `${slot.source}; above-table`;
  }
  if (!consumable.length) consumable.push({ targetLevel: Math.min(20, ctx.level + 1), count: 1, source: "session minimum" });

  const currency = Math.floor((spec.currency + extraPcs * spec.extraPc) * fraction);
  return {
    permanent,
    consumable,
    currency,
    budget: Math.floor((spec.total + estimatePlanBudget(ctx.level, fullPermanent.slice(4), fullConsumable.slice(6), extraPcs * spec.extraPc)) * fraction),
    exactLevels: false,
  };
}

function objectSlots(obj) {
  return Object.entries(obj ?? {}).map(([targetLevel, count]) => ({ targetLevel: Number(targetLevel), count: Number(count) || 0 }));
}

function fractionalSlots(slots, fraction) {
  const out = [];
  for (const slot of slots) {
    const expected = Math.max(0, (Number(slot.count) || 0) * fraction);
    const whole = Math.floor(expected);
    const extra = Math.random() < (expected - whole) ? 1 : 0;
    const count = whole + extra;
    if (count > 0) out.push({ targetLevel: slot.targetLevel, count });
  }
  return out;
}

function estimatePlanBudget(partyLevel, permanentSlots, consumableSlots, currency) {
  let total = Number(currency) || 0;
  for (const slot of permanentSlots ?? []) total += itemValueEstimate(slot.targetLevel) * (slot.count || 1);
  for (const slot of consumableSlots ?? []) total += consumableValueEstimate(slot.targetLevel) * (slot.count || 1);
  return Math.max(0, Math.round(total));
}

function itemValueEstimate(level) {
  const table = {
    1: 15, 2: 35, 3: 60, 4: 100, 5: 160, 6: 250, 7: 360, 8: 500, 9: 700, 10: 1000,
    11: 1400, 12: 2000, 13: 3000, 14: 4500, 15: 6500, 16: 10000, 17: 15000, 18: 24000, 19: 40000, 20: 70000,
  };
  return table[clampLevel(level)] ?? 15;
}

function consumableValueEstimate(level) {
  const table = {
    1: 4, 2: 7, 3: 12, 4: 20, 5: 30, 6: 45, 7: 70, 8: 95, 9: 150, 10: 200,
    11: 300, 12: 400, 13: 600, 14: 900, 15: 1300, 16: 2000, 17: 3000, 18: 4500, 19: 8000, 20: 12000,
  };
  return table[clampLevel(level)] ?? 4;
}

async function preloadCuratedIndex() {
  if (cache.ready) return cache.entries;
  const packSetting = game.settings.get(MODULE, "pack-equipment") || game.settings.get(MODULE, "packEquipment") || "pf2e.equipment-srd";
  const packIds = String(packSetting).split(",").map(s => s.trim()).filter(Boolean);
  // Ask the compendium index for the top-level system object instead of
  // nested paths such as system.level.value. Some PF2e entries still use a
  // primitive at one of these intermediate paths, and Foundry's nested-path
  // indexer can throw: "Cannot use 'in' operator to search for 'value' in 1".
  // The curated scorer already handles both { value } objects and primitive
  // values, so loading the top-level system data is safer across PF2e versions.
  const fields = ["type", "name", "img", "system"];

  const entries = [];
  for (const packId of packIds) {
    const pack = game.packs.get(packId);
    if (!pack) {
      console.warn(`${MODULE}: curated loot missing compendium ${packId}`);
      continue;
    }
    let index;
    try {
      index = await pack.getIndex({ fields });
    } catch (error) {
      console.warn(`${MODULE}: curated loot system-field index failed for ${packId}; retrying with default index`, error);
      index = await pack.getIndex();
    }
    for (const entry of index) entries.push({ ...entry, __pack: packId });
  }
  cache.entries = entries;
  cache.ready = true;
  return entries;
}

async function preloadSpellIndex() {
  if (cache.spellsReady) return cache.spellEntries;
  const packIds = ["pf2e.spells-srd"];
  // Same nested-path safety as equipment indexing.
  const fields = ["type", "name", "img", "system"];
  const entries = [];
  for (const packId of packIds) {
    const pack = game.packs.get(packId);
    if (!pack) continue;
    let index;
    try {
      index = await pack.getIndex({ fields });
    } catch (error) {
      console.warn(`${MODULE}: curated loot system-field index failed for ${packId}; retrying with default index`, error);
      index = await pack.getIndex();
    }
    for (const entry of index) entries.push({ ...entry, __pack: packId });
  }
  cache.spellEntries = entries;
  cache.spellsReady = true;
  return entries;
}

async function getDoc(entry) {
  const key = `${entry.__pack}:${entry._id}`;
  if (cache.docs.has(key)) return cache.docs.get(key);
  const pack = game.packs.get(entry.__pack);
  const doc = await pack?.getDocument(entry._id);
  if (doc) cache.docs.set(key, doc);
  return doc;
}

async function getSpellDoc(entry) {
  const key = `${entry.__pack}:${entry._id}`;
  if (cache.spellDocs.has(key)) return cache.spellDocs.get(key);
  const pack = game.packs.get(entry.__pack);
  const doc = await pack?.getDocument(entry._id);
  if (doc) cache.spellDocs.set(key, doc);
  return doc;
}

function isJunk(entry) {
  const regexText = game.settings.get(MODULE, "curatedJunkNameRegex") || DEFAULT_JUNK_REGEX;
  if (!regexText) return false;
  try {
    return new RegExp(regexText, "i").test(entry?.name ?? "");
  } catch (error) {
    console.warn(`${MODULE}: invalid curatedJunkNameRegex`, error);
    return false;
  }
}

function hardBlockReason(entry) {
  if (!entry) return "missing entry";
  const blob = textBlob(entry);
  if (isJunk(entry)) return "junk/trade-good name";
  if (itemRarity(entry) === "unique") return "unique item";
  if (new RegExp(STORY_OR_NO_RANDOM_REGEX, "i").test(entry?.name ?? "")) return "story/quest-like item name";
  if (/(?:^|\s)(vehicle|siege|structure)(?:\s|$)/i.test(blob)) return "vehicle/siege/structure item";
  if (priceToGP(entry) <= 0) return "0 gp or no price";
  return null;
}

function audienceForEntry(entry, kind = null) {
  const traits = traitList(entry);
  const blob = textBlob(entry);
  const roles = new Set();
  const keywords = new Set();
  const reasons = [];
  const blockReason = hardBlockReason(entry);
  const isConsumable = entry?.type === "consumable";
  const isPermanent = ["equipment", "weapon", "armor", "shield"].includes(entry?.type);
  let general = false;

  if (kind === "consumable" && !isConsumable) return { general: false, roles, keywords, reasons, blockReason: "not a consumable" };
  if (kind === "permanent" && !isPermanent) return { general: false, roles, keywords, reasons, blockReason: "not permanent equipment" };
  if (!isConsumable && !isPermanent) return { general: false, roles, keywords, reasons, blockReason: "unsupported item type" };
  if (blockReason) return { general: false, roles, keywords, reasons, blockReason };

  const addRole = (role, reason) => { roles.add(role); if (reason) reasons.push(reason); };
  const addKeyword = (word) => keywords.add(word);

  if (isPermanent) {
    if (entry.type === "weapon") { addRole("martial", "weapon"); addRole("weapon"); }
    if (entry.type === "armor") { addRole("armor", "armor"); addRole("martial"); }
    if (entry.type === "shield") { addRole("shield", "shield"); addRole("martial"); }

    if (GENERAL_PERMANENT_KEYWORDS.some(w => blob.includes(w))) { general = true; reasons.push("broad worn/utility permanent"); }
    if (CASTER_PERMANENT_KEYWORDS.some(w => blob.includes(w))) addRole("caster", "caster-only permanent");
    if (MARTIAL_PERMANENT_KEYWORDS.some(w => blob.includes(w))) addRole("martial", "martial permanent");
    if (/thrower|throwing|bandolier|ammunition|arrow|bolt|bow|crossbow/.test(blob)) { addRole("ranged", "ranged/thrown permanent"); addRole("martial"); }
    for (const tradition of ["arcane", "divine", "occult", "primal"]) {
      if (traits.includes(tradition) || blob.includes(tradition)) addRole(tradition, `${tradition} item`);
    }
    if (traits.includes("invested") && !roles.size) general = true;
  }

  if (isConsumable) {
    const ctype = String(entry.system?.consumableType?.value ?? "").toLowerCase();
    if (GENERAL_CONSUMABLE_KEYWORDS.some(w => blob.includes(w)) || ["potion", "elixir"].includes(ctype)) {
      general = true;
      reasons.push("broad potion/elixir/remedy");
    }
    if (ctype === "scroll" || traits.includes("scroll") || /scroll of a .*rank spell/i.test(entry.name ?? "")) addRole("caster", "scroll");
    if (ctype === "catalyst" || traits.includes("catalyst") || blob.includes("catalyst")) addRole("caster", "spell catalyst");
    if (CASTER_CONSUMABLE_KEYWORDS.some(w => blob.includes(w)) && (blob.includes("catalyst") || blob.includes("scroll"))) addRole("caster", "caster consumable");
    if (traits.includes("fulu") || ctype === "fulu") addRole("caster", "fulu/magical script");
    if (ctype === "talisman" || traits.includes("talisman") || blob.includes("talisman")) { general = true; addRole("martial", "talisman"); addRole("skill", "talisman"); }
    if (ctype === "oil" || traits.includes("oil") || blob.includes("oil")) addRole("martial", "oil");
    if (ctype === "ammo" || traits.includes("ammunition") || /ammunition|arrow|bolt/.test(blob)) addRole("ranged", "ammunition");
    if (ctype === "bomb" || traits.includes("bomb") || blob.includes("bomb")) { addRole("alchemical", "bomb"); addRole("martial", "bomb"); }
    if (ctype === "mutagen" || traits.includes("mutagen") || blob.includes("mutagen")) { addRole("alchemical", "mutagen"); addRole("martial", "mutagen"); general = false; }
    if (ctype === "poison" || traits.includes("poison") || blob.includes("poison")) { addRole("alchemical", "poison"); addKeyword("poison"); general = false; }
    if (ctype === "drug" || traits.includes("drug") || blob.includes("drug")) { addRole("alchemical", "drug"); general = false; }
    if (ctype === "snare" || traits.includes("snare") || blob.includes("snare")) { addRole("crafting", "snare"); general = false; }
    for (const tradition of ["arcane", "divine", "occult", "primal"]) {
      if (traits.includes(tradition) || blob.includes(tradition)) addRole(tradition, `${tradition} consumable`);
    }
  }

  for (const word of [...GENERAL_PERMANENT_KEYWORDS, ...CASTER_PERMANENT_KEYWORDS, ...MARTIAL_PERMANENT_KEYWORDS, ...GENERAL_CONSUMABLE_KEYWORDS, ...CASTER_CONSUMABLE_KEYWORDS, ...MARTIAL_CONSUMABLE_KEYWORDS, ...ALCHEMICAL_CONSUMABLE_KEYWORDS]) {
    if (blob.includes(word)) addKeyword(word);
  }

  if (roles.has("caster") || roles.has("alchemical") || roles.has("martial") || roles.has("ranged") || roles.has("crafting")) {
    // Narrow audience items should not be labeled or selected as general.
    if (roles.has("caster") || roles.has("alchemical") || roles.has("ranged") || roles.has("crafting")) general = false;
  }

  return { general, roles, keywords, reasons, blockReason: null };
}

function audienceMatchesParty(audience, ctx) {
  if (audience.general) return true;
  if (audience.roles.has("caster") && counterHas(ctx.roles, "caster")) return true;
  for (const role of audience.roles) if (counterHas(ctx.roles, role)) return true;
  for (const word of audience.keywords) if (counterHas(ctx.keywords, word)) return true;
  return false;
}

function audienceMatchesActor(audience, actorProfile, ctx) {
  if (audience.general) return true;
  if (!actorProfile) return audienceMatchesParty(audience, ctx);
  const localRoles = new Map();
  const localKeywords = new Map();
  if (actorProfile.classSlug) applyClassProfile(actorProfile.classSlug, localRoles, localKeywords, 1);
  for (const t of actorProfile.traditions ?? []) counterAdd(localRoles, t);
  if ((audience.roles.has("caster") || [...audience.roles].some(r => ["arcane", "divine", "occult", "primal"].includes(r))) && !counterHas(localRoles, "caster")) return false;
  for (const role of audience.roles) if (counterHas(localRoles, role)) return true;
  for (const word of audience.keywords) if (counterHas(localKeywords, word)) return true;
  return false;
}

function isUsefulEntry(entry, ctx, kind, lane, spotlight) {
  const audience = audienceForEntry(entry, kind);
  if (audience.blockReason) return false;
  if (lane === "general") return audience.general;
  if (lane === "spotlight") return audienceMatchesActor(audience, spotlight, ctx);
  return audienceMatchesParty(audience, ctx);
}

function chooseLane(mode, kind, ctx) {
  if (mode === "one-permanent") return { type: "spotlight", spotlight: randomSpotlight(ctx) };
  const roll = Math.random();
  if (roll < 0.70) return { type: "general", spotlight: null };
  if (roll < 0.90) return { type: "party", spotlight: null };
  return { type: "spotlight", spotlight: randomSpotlight(ctx) };
}

function randomSpotlight(ctx) {
  const profiles = ctx.actorProfiles.filter(p => p.actor && p.classSlug);
  if (!profiles.length) return null;
  return profiles[Math.floor(Math.random() * profiles.length)];
}

function scoreEntry(entry, ctx, kind, targetLevel, lane = "party", spotlight = null) {
  const blob = textBlob(entry);
  const traits = traitList(entry);
  const audience = audienceForEntry(entry, kind);
  if (audience.blockReason) return 0;
  let score = 1;

  const distance = Math.abs(entryLevel(entry) - targetLevel);
  score += Math.max(0, 10 - distance * 4);
  if (entryLevel(entry) > targetLevel) score -= 2 * (entryLevel(entry) - targetLevel);

  const generalKeywords = kind === "permanent" ? GENERAL_PERMANENT_KEYWORDS : GENERAL_CONSUMABLE_KEYWORDS;
  const roleKeywords = kind === "permanent"
    ? [...CASTER_PERMANENT_KEYWORDS, ...MARTIAL_PERMANENT_KEYWORDS]
    : [...CASTER_CONSUMABLE_KEYWORDS, ...MARTIAL_CONSUMABLE_KEYWORDS, ...ALCHEMICAL_CONSUMABLE_KEYWORDS];
  for (const word of generalKeywords) if (blob.includes(word)) score += 2;
  if (lane !== "general") for (const word of roleKeywords) if (blob.includes(word)) score += 2;

  if (kind === "permanent") {
    if (traits.includes("invested")) score += 3;
    if (traits.includes("rune") || blob.includes("rune")) score += 5;
    if (blob.includes("weapon potency") || blob.includes("striking") || blob.includes("resilient") || blob.includes("reinforcing")) score += 6;
    if (blob.includes("spacious pouch") || blob.includes("bag of holding")) score += 4;
  } else {
    if (blob.includes("elixir of life") || blob.includes("healing potion") || blob.includes("healing")) score += 7;
    if (blob.includes("antidote") || blob.includes("antiplague") || blob.includes("antivenom")) score += 2;
  }

  const partyWeight = Number(game.settings.get(MODULE, "curatedPartyWeight")) || 0;
  if (lane === "party") score += scoreAgainstCounters(blob, traits, ctx.roles, ctx.keywords, ctx.traditions, partyWeight);
  if (lane === "spotlight" && spotlight) {
    const localRoles = new Map();
    const localKeywords = new Map();
    if (spotlight.classSlug) applyClassProfile(spotlight.classSlug, localRoles, localKeywords, 1);
    const localTraditions = new Map();
    for (const t of spotlight.traditions ?? []) { counterAdd(localTraditions, t); counterAdd(localRoles, t); }
    score += scoreAgainstCounters(blob, traits, localRoles, localKeywords, localTraditions, partyWeight * 1.5);
  }

  for (const narrow of ["underwater", "aquatic", "vehicle", "siege", "structure"]) {
    if (blob.includes(narrow)) score -= 6;
  }

  return Math.max(0, score) * rarityMultiplier(entry) * (0.9 + Math.random() * 0.2);
}

function scoreAgainstCounters(blob, traits, roles, keywords, traditions, partyWeight) {
  let score = 0;
  for (const [role, count] of roles.entries()) {
    for (const word of ROLE_KEYWORDS[role] ?? []) {
      if (blob.includes(word)) score += partyWeight * count;
    }
  }
  for (const [word, count] of keywords.entries()) {
    if (blob.includes(word)) score += partyWeight * count;
  }
  for (const [tradition, count] of traditions.entries()) {
    if (traits.includes(tradition) || blob.includes(tradition)) score += partyWeight * 1.5 * count;
  }
  return score;
}

function weightedPick(pool, scoreFn, alreadyPicked, budgetFilter = null) {
  const candidates = pool.filter(e => !alreadyPicked.has(`${e.__pack}:${e._id}`) && (!budgetFilter || budgetFilter(e)));
  if (!candidates.length) return null;
  const weights = candidates.map(scoreFn);
  const total = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0);
  if (total <= 0) return null;
  let roll = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    roll -= Math.max(0, weights[i]);
    if (roll <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

function poolFor(entries, ctx, kind, targetLevel, lane, spotlight, exactLevels) {
  const predicate = entry => isUsefulEntry(entry, ctx, kind, lane, spotlight);
  const exact = entries.filter(entry => predicate(entry) && entryLevel(entry) === targetLevel);
  if (exact.length) return exact;
  if (exactLevels) return [];
  for (let radius = 1; radius <= 3; radius++) {
    const pool = entries.filter(entry => predicate(entry) && Math.abs(entryLevel(entry) - targetLevel) <= radius);
    if (pool.length) return pool;
  }
  return [];
}

async function safeGenerateCuratedLoot(actor, options = {}) {
  try {
    return await generateCuratedLoot(actor, options);
  } catch (error) {
    console.error(`${MODULE}: curated loot generation failed`, { actor, options, error });
    ui.notifications?.error(`Curated loot failed: ${error?.message ?? error}`);
    throw error;
  }
}

async function generateCuratedLoot(actor, { mode = "session" } = {}) {
  if (!actor) return ui.notifications?.warn("No loot actor selected.");
  if (!isLootActor(actor)) return ui.notifications?.warn("Curated loot can only be generated on a loot actor.");

  const ctx = partyContext();
  const entries = await preloadCuratedIndex();
  const plan = selectionPlan(ctx, mode);
  const pickedKeys = new Set();
  const toCreate = [];
  const summary = [];
  let itemValue = 0;
  const slack = Math.max(1, Number(game.settings.get(MODULE, "curatedBudgetSlack")) || 1.15);
  const softCap = Math.max(plan.budget || 0, plan.currency || 0) * slack;

  const choose = async (kind, slot) => {
    for (let i = 0; i < slot.count; i++) {
      const lane = chooseLane(mode, kind, ctx);
      let pool = poolFor(entries, ctx, kind, slot.targetLevel, lane.type, lane.spotlight, plan.exactLevels);
      let effectiveLane = lane;
      if (!pool.length && lane.type === "general") {
        effectiveLane = { type: "party", spotlight: null };
        pool = poolFor(entries, ctx, kind, slot.targetLevel, "party", null, plan.exactLevels);
      }
      if (!pool.length && lane.type !== "general") {
        effectiveLane = { type: "general", spotlight: null };
        pool = poolFor(entries, ctx, kind, slot.targetLevel, "general", null, plan.exactLevels);
      }
      const budgetFilter = (entry) => softCap <= 0 || (itemValue + priceToGP(entry) + plan.currency) <= softCap;
      const entry = weightedPick(pool, e => scoreEntry(e, ctx, kind, slot.targetLevel, effectiveLane.type, effectiveLane.spotlight), pickedKeys, budgetFilter)
        ?? weightedPick(pool, e => scoreEntry(e, ctx, kind, slot.targetLevel, effectiveLane.type, effectiveLane.spotlight), pickedKeys);
      if (!entry) continue;
      pickedKeys.add(`${entry.__pack}:${entry._id}`);
      const raw = await rawItem(entry, ctx, kind, slot.targetLevel, effectiveLane, mode);
      if (!raw) continue;
      const value = priceToGP(raw) || priceToGP(entry);
      itemValue += value;
      toCreate.push(raw);
      const actualLevel = entryLevel(raw) || entryLevel(entry);
      const targetNote = actualLevel === slot.targetLevel ? "" : ` for target ${slot.targetLevel}`;
      const laneLabel = laneLabelFor(effectiveLane);
      summary.push(`${kind === "permanent" ? "Permanent" : "Consumable"} ${actualLevel}${targetNote}: ${raw.name} (${laneLabel})`);
    }
  };

  for (const slot of plan.permanent) await choose("permanent", slot);
  for (const slot of plan.consumable) await choose("consumable", slot);

  let currency = plan.currency;
  if (softCap > 0 && itemValue + currency > softCap) currency = Math.max(0, Math.floor(softCap - itemValue));

  if (toCreate.length) {
    try {
      await actor.createEmbeddedDocuments("Item", toCreate);
    } catch (error) {
      console.error(`${MODULE}: failed while creating curated item documents`, { mode, actor, toCreate, error });
      ui.notifications?.error("Curated loot failed while creating item documents. See console for the item source that failed.");
      throw error;
    }
  }
  if (currency > 0) {
    try {
      await addCurrencyGP(actor, currency);
      summary.push(`Currency: ${currency} gp equivalent`);
    } catch (error) {
      console.error(`${MODULE}: failed while adding curated currency`, { mode, actor, currency, error });
      ui.notifications?.error("Curated loot failed while adding currency. See console for details.");
      throw error;
    }
  }

  const names = ctx.actors.map(a => a.name).join(", ") || "fallback party";
  const classProfile = counterSummary(ctx.classCounts).map(([c, n]) => `${c} ×${n}`).join(", ") || "none";
  const ignored = ctx.resolution.ignored.map(i => `${i.actor?.name ?? "Unknown"} (${i.reason})`).join(", ") || "none";
  const planSummary = planLine(plan);
  const content = `<h3>Curated Loot Generated</h3>
    <p><strong>Mode:</strong> ${escapeHtml(mode)}<br>
    <strong>Party source:</strong> ${escapeHtml(ctx.resolution.source)}<br>
    <strong>Party:</strong> ${escapeHtml(names)}<br>
    <strong>Average Level:</strong> ${ctx.level}<br>
    <strong>Class profile:</strong> ${escapeHtml(classProfile)}<br>
    <strong>Ignored non-PC actors:</strong> ${escapeHtml(ignored)}<br>
    <strong>Rules slots:</strong> ${escapeHtml(planSummary)}</p>
    <ul>${summary.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
    <p><strong>Budget:</strong> item value ${roundGp(itemValue)} gp + currency ${roundGp(currency)} gp / soft cap ${roundGp(softCap)} gp</p>`;
  ChatMessage.create({ content, whisper: ChatMessage.getWhisperRecipients("GM") });
  ui.notifications?.info(`Curated loot generated: ${summary.length} reward entries.`);
}

function laneLabelFor(lane) {
  if (lane.type === "general") return "general useful";
  if (lane.type === "spotlight") return `spotlight ${lane.spotlight?.actor?.name ?? "PC"}${lane.spotlight?.classSlug ? ` (${lane.spotlight.classSlug})` : ""}`;
  return "party weighted";
}

function planLine(plan) {
  const fmt = slots => slots.map(s => `${s.targetLevel}×${s.count}${s.source ? ` ${s.source}` : ""}`).join(", ") || "none";
  return `permanent [${fmt(plan.permanent)}]; consumable [${fmt(plan.consumable)}]; currency ${plan.currency} gp`;
}

function roundGp(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

async function rawItem(entry, ctx, kind, targetLevel, lane, mode) {
  if (kind === "consumable" && game.settings.get(MODULE, "curatedSpecificScrolls") && isGenericScroll(entry)) {
    const scroll = await makeSpecificScroll(entry, ctx, targetLevel, lane);
    if (scroll) return scroll;
  }

  const doc = await getDoc(entry);
  if (!doc) return null;
  const raw = doc.toObject();
  delete raw._id;
  raw.system = raw.system ?? {};
  setItemQuantity(raw, 1);
  raw.flags = raw.flags ?? {};
  raw.flags[MODULE] = {
    ...(raw.flags[MODULE] ?? {}),
    curated: true,
    source: { pack: entry.__pack, id: entry._id },
    audience: [...audienceForEntry(entry, kind).roles],
    lane: laneLabelFor(lane),
    mode,
  };
  return raw;
}

function isGenericScroll(entry) {
  const blob = textBlob(entry);
  return entry?.type === "consumable" && (traitList(entry).includes("scroll") || entry.system?.consumableType?.value === "scroll" || /scroll of a .*rank spell/i.test(entry.name ?? "") || blob.includes("scroll of a"));
}

function scrollRankFromEntry(entry, targetLevel) {
  const name = String(entry?.name ?? "");
  const match = name.match(/(\d+)(?:st|nd|rd|th)?[-\s]*(?:rank|level)/i);
  if (match) return Math.max(1, Math.min(10, Number(match[1]) || 1));
  const level = entryLevel(entry) || targetLevel || 1;
  if (level <= 1) return 1;
  if (level >= 19) return 10;
  return Math.max(1, Math.min(10, Math.ceil(level / 2)));
}

async function makeSpecificScroll(scrollEntry, ctx, targetLevel, lane) {
  const rank = scrollRankFromEntry(scrollEntry, targetLevel);
  const spellEntry = await pickSpellForScroll(rank, ctx, lane);
  if (!spellEntry) return null;
  const spellDoc = await getSpellDoc(spellEntry);
  if (!spellDoc) return null;

  const generated = await trySystemScrollGeneration(spellDoc, rank);
  if (generated) {
    generated.flags = generated.flags ?? {};
    generated.flags[MODULE] = {
      ...(generated.flags[MODULE] ?? {}),
      curated: true,
      generatedSpecificScroll: true,
      spell: { pack: spellEntry.__pack, id: spellEntry._id },
      source: { pack: scrollEntry.__pack, id: scrollEntry._id },
      lane: laneLabelFor(lane),
    };
    return generated;
  }

  const scrollDoc = await getDoc(scrollEntry);
  if (!scrollDoc) return null;
  const raw = scrollDoc.toObject();
  const spellRaw = spellDoc.toObject();
  delete raw._id;
  raw.name = `Scroll of ${spellDoc.name} (${ordinal(rank)} Rank)`;
  raw.img = spellDoc.img ?? raw.img;
  raw.system = raw.system ?? {};
  setItemQuantity(raw, 1);
  setLevelValue(raw, SCROLL_ITEM_LEVEL_BY_RANK[rank] ?? entryLevel(scrollEntry));
  raw.system.price = raw.system.price ?? {};
  raw.system.price.value = { gp: SCROLL_PRICE_BY_RANK[rank] ?? priceToGP(scrollEntry) };
  raw.system.spell = spellRaw;
  raw.system.description = raw.system.description ?? {};
  const original = raw.system.description.value ?? "";
  raw.system.description.value = `${original}<hr><p><strong>Curated scroll spell:</strong> ${spellDoc.name}, rank ${rank}.</p>`;
  const spellTraits = spellRaw.system?.traits?.value ?? [];
  raw.system.traits = raw.system.traits ?? {};
  raw.system.traits.value = Array.from(new Set([...(raw.system.traits.value ?? []), "scroll", "magical", ...spellTraits]));
  raw.system.traits.rarity = spellRaw.system?.traits?.rarity ?? raw.system.traits.rarity ?? "common";
  raw.flags = raw.flags ?? {};
  raw.flags[MODULE] = {
    ...(raw.flags[MODULE] ?? {}),
    curated: true,
    generatedSpecificScroll: true,
    generatedByFallback: true,
    spell: { pack: spellEntry.__pack, id: spellEntry._id },
    source: { pack: scrollEntry.__pack, id: scrollEntry._id },
    lane: laneLabelFor(lane),
  };
  return raw;
}

async function trySystemScrollGeneration(spellDoc, rank) {
  const attempts = [
    () => spellDoc.toScroll?.({ rank }),
    () => spellDoc.toScroll?.({ castRank: rank }),
    () => spellDoc.toScroll?.(rank),
    () => spellDoc.toConsumable?.({ type: "scroll", rank }),
    () => spellDoc.toConsumable?.("scroll", rank),
  ];
  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (!result) continue;
      const raw = typeof result.toObject === "function" ? result.toObject() : foundry.utils.deepClone(result);
      if (!raw?.name) continue;
      delete raw._id;
      raw.system = raw.system ?? {};
      setItemQuantity(raw, 1);
      return raw;
    } catch (_error) {
      // Try the next known PF2e API shape.
    }
  }
  return null;
}

async function pickSpellForScroll(rank, ctx, lane) {
  const spells = await preloadSpellIndex();
  const traditions = new Set([...ctx.traditions.keys()]);
  if (!traditions.size) {
    for (const role of ["arcane", "divine", "occult", "primal"]) if (counterHas(ctx.roles, role)) traditions.add(role);
  }
  let pool = spells.filter(spell => isScrollableSpell(spell, rank, traditions));
  if (!pool.length) pool = spells.filter(spell => isScrollableSpell(spell, rank, null));
  if (!pool.length) return null;
  const weights = pool.map(spell => scoreSpellForScroll(spell, ctx, lane));
  const total = weights.reduce((s, w) => s + Math.max(0, w), 0);
  if (total <= 0) return pool[Math.floor(Math.random() * pool.length)];
  let roll = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= Math.max(0, weights[i]);
    if (roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function isScrollableSpell(spell, rank, traditions) {
  if (spell?.type !== "spell") return false;
  const level = Number(spell.system?.level?.value ?? 0);
  if (level !== rank) return false;
  const category = String(spell.system?.category?.value ?? "").toLowerCase();
  if (["cantrip", "focus", "ritual"].includes(category)) return false;
  const spellTraditions = toArray(spell.system?.traditions?.value).map(t => String(t).toLowerCase());
  if (traditions?.size && !spellTraditions.some(t => traditions.has(t))) return false;
  if (itemRarity(spell) === "unique") return false;
  return true;
}

function scoreSpellForScroll(spell, ctx, lane) {
  const blob = textBlob(spell);
  let score = 1;
  const rarity = itemRarity(spell);
  if (rarity === "rare") score *= Math.max(0, Number(game.settings.get(MODULE, "curatedRareWeight")) || 0.12);
  if (rarity === "uncommon") score *= Math.max(0, Number(game.settings.get(MODULE, "curatedUncommonWeight")) || 0.45);
  for (const word of ["heal", "soothe", "fear", "invisibility", "dispel", "restoration", "sanctuary", "bless", "heroism", "haste", "fly", "see", "darkvision", "water breathing", "resist", "cleanse"]) {
    if (blob.includes(word)) score += 4;
  }
  const partyWeight = Number(game.settings.get(MODULE, "curatedPartyWeight")) || 0;
  score += scoreAgainstCounters(blob, traitList(spell), ctx.roles, ctx.keywords, ctx.traditions, lane.type === "spotlight" ? partyWeight * 0.75 : partyWeight * 0.5);
  return Math.max(0.01, score) * (0.9 + Math.random() * 0.2);
}

function ordinal(n) {
  const num = Number(n) || 1;
  const suffix = num === 1 ? "1st" : num === 2 ? "2nd" : num === 3 ? "3rd" : `${num}th`;
  return suffix;
}

function currencyFromGP(gpAmount) {
  let cp = Math.max(0, Math.floor((Number(gpAmount) || 0) * 100));
  const pp = Math.floor(cp / 1000); cp -= pp * 1000;
  const gp = Math.floor(cp / 100); cp -= gp * 100;
  const sp = Math.floor(cp / 10); cp -= sp * 10;
  return { pp, gp, sp, cp };
}

async function addCurrencyGP(actor, gpAmount) {
  const currency = currencyFromGP(gpAmount);
  if (!hasAnyCurrencyObj(currency)) return false;

  const inv = actor?.inventory;
  try {
    const Coins =
      (inv?.coins?.constructor && typeof inv.coins.constructor.fromObject === "function" ? inv.coins.constructor : null)
      || (game?.pf2e?.Coins && typeof game.pf2e.Coins.fromObject === "function" ? game.pf2e.Coins : null)
      || (game?.sf2e?.Coins && typeof game.sf2e.Coins.fromObject === "function" ? game.sf2e.Coins : null);
    const coins = Coins ? Coins.fromObject(currency) : currency;
    if (inv?.addCurrency) return await inv.addCurrency(coins);
    if (inv?.addCoins) return await inv.addCoins(coins);
  } catch (error) {
    console.warn(`${MODULE}: PF2e/SF2e coin API failed; falling back to safe currency merge`, error);
  }

  // Do not read paths like system.currency.gp.value. In worlds where gp is a
  // bare number, Foundry's getProperty can throw:
  // "Cannot use 'in' operator to search for 'value' in 1".
  // Instead, copy the existing currency container and preserve each coin's
  // existing shape: number stays number, { value } stays { value }.
  const path = actor?.system?.currency ? "system.currency"
    : actor?.system?.coins ? "system.coins"
    : actor?.system?.resources?.currency ? "system.resources.currency"
    : "system.currency";

  let existing = {};
  try {
    existing = foundry.utils.getProperty(actor, path) ?? {};
  } catch (error) {
    console.warn(`${MODULE}: direct currency container read failed; using empty currency fallback`, error);
    existing = {};
  }

  const merged = mergeCurrency(existing, currency);
  try {
    return await actor.update({ [path]: merged });
  } catch (error) {
    console.error(`${MODULE}: failed to add currency`, { actor, path, existing, currency, merged, error });
    throw error;
  }
}
