/*
 * PF2e Curated Autoloot extension
 *
 * Add this file to module.json esmodules after scripts/pf2e-autoloot.js.
 * It provides a curated, party-aware loot generator while leaving the
 * original module in place.
 */

const MODULE = "pf2e-autoloot";
const API_NAME = "pf2eCuratedAutoloot";

const TREASURE_BY_LEVEL = {
  1: { permanent: { 2: 2, 1: 2 }, consumable: { 2: 2, 1: 3 }, currency: 40, extraPc: 10 },
  2: { permanent: { 3: 2, 2: 2 }, consumable: { 3: 2, 2: 2, 1: 2 }, currency: 70, extraPc: 18 },
  3: { permanent: { 4: 2, 3: 2 }, consumable: { 4: 2, 3: 2, 2: 2 }, currency: 120, extraPc: 30 },
  4: { permanent: { 5: 2, 4: 2 }, consumable: { 5: 2, 4: 2, 3: 2 }, currency: 200, extraPc: 50 },
  5: { permanent: { 6: 2, 5: 2 }, consumable: { 6: 2, 5: 2, 4: 2 }, currency: 320, extraPc: 80 },
  6: { permanent: { 7: 2, 6: 2 }, consumable: { 7: 2, 6: 2, 5: 2 }, currency: 500, extraPc: 125 },
  7: { permanent: { 8: 2, 7: 2 }, consumable: { 8: 2, 7: 2, 6: 2 }, currency: 720, extraPc: 180 },
  8: { permanent: { 9: 2, 8: 2 }, consumable: { 9: 2, 8: 2, 7: 2 }, currency: 1000, extraPc: 250 },
  9: { permanent: { 10: 2, 9: 2 }, consumable: { 10: 2, 9: 2, 8: 2 }, currency: 1400, extraPc: 350 },
  10: { permanent: { 11: 2, 10: 2 }, consumable: { 11: 2, 10: 2, 9: 2 }, currency: 2000, extraPc: 500 },
  11: { permanent: { 12: 2, 11: 2 }, consumable: { 12: 2, 11: 2, 10: 2 }, currency: 2800, extraPc: 700 },
  12: { permanent: { 13: 2, 12: 2 }, consumable: { 13: 2, 12: 2, 11: 2 }, currency: 4000, extraPc: 1000 },
  13: { permanent: { 14: 2, 13: 2 }, consumable: { 14: 2, 13: 2, 12: 2 }, currency: 6000, extraPc: 1500 },
  14: { permanent: { 15: 2, 14: 2 }, consumable: { 15: 2, 14: 2, 13: 2 }, currency: 9000, extraPc: 2250 },
  15: { permanent: { 16: 2, 15: 2 }, consumable: { 16: 2, 15: 2, 14: 2 }, currency: 13000, extraPc: 3250 },
  16: { permanent: { 17: 2, 16: 2 }, consumable: { 17: 2, 16: 2, 15: 2 }, currency: 20000, extraPc: 5000 },
  17: { permanent: { 18: 2, 17: 2 }, consumable: { 18: 2, 17: 2, 16: 2 }, currency: 30000, extraPc: 7500 },
  18: { permanent: { 19: 2, 18: 2 }, consumable: { 19: 2, 18: 2, 17: 2 }, currency: 48000, extraPc: 12000 },
  19: { permanent: { 20: 2, 19: 2 }, consumable: { 20: 2, 19: 2, 18: 2 }, currency: 80000, extraPc: 20000 },
  20: { permanent: { 20: 4 }, consumable: { 20: 4, 19: 2 }, currency: 140000, extraPc: 35000 },
};

const TOTAL_VALUE_BY_LEVEL = {
  1: 175, 2: 300, 3: 500, 4: 850, 5: 1350, 6: 2000, 7: 2900,
  8: 4000, 9: 5700, 10: 8000, 11: 11500, 12: 16500,
  13: 25000, 14: 36500, 15: 54500, 16: 82500, 17: 128000,
  18: 208000, 19: 355000, 20: 490000,
};

const DEFAULT_JUNK_REGEX = [
  "coffee", "beans?", "coal", "flour", "grain", "wheat", "corn", "oats?",
  "rations?", "jerky", "cheese", "soap", "chalk", "candle", "rope", "twine",
  "lumber", "timber", "ore", "ingot", "hide", "pelt", "cloth", "textile",
  "bottle", "jug", "mug", "plate", "cup", "fork", "spoon", "broom", "bucket",
  "ladder", "pole", "tent", "bedroll", "backpack", "sack", "satchel", "barrel",
  "crate", "chest", "tool", "artisan", "trade good", "livestock", "feed", "hay"
].join("|");

const COMMON_PERMANENT_KEYWORDS = [
  "rune", "weapon potency", "striking", "resilient", "reinforcing", "property rune",
  "wand", "staff", "spellheart", "aeon stone", "spacious pouch", "bag of holding",
  "cloak", "boots", "gloves", "gauntlets", "goggles", "lenses", "bracers", "robe",
  "ring", "amulet", "pendant", "belt", "headband", "crown", "hat", "mask",
  "armor", "shield", "buckler", "talisman cord", "wayfinder", "grimoire"
];

const COMMON_CONSUMABLE_KEYWORDS = [
  "potion", "elixir", "elixir of life", "scroll", "wand", "oil", "talisman", "fulu",
  "mutagen", "bomb", "antidote", "antiplague", "catalyst", "spell catalyst", "snare",
  "healing", "invisibility", "flight", "flying", "darkvision", "resistance"
];

const CLASS_PROFILES = {
  alchemist: { roles: ["alchemical", "skill"], any: ["elixir", "bomb", "mutagen", "alchemical", "formula", "goggles", "tools", "healing"] },
  animist: { roles: ["caster", "divine", "primal", "wisdom"], any: ["staff", "wand", "scroll", "healing", "spirit", "vitality", "divine", "primal", "religion", "nature"] },
  barbarian: { roles: ["martial", "strength"], any: ["rune", "weapon", "striking", "potency", "boots", "belt", "bracers", "talisman", "healing"] },
  bard: { roles: ["caster", "occult", "skill", "charisma"], any: ["staff", "wand", "scroll", "occult", "performance", "diplomacy", "deception", "mental", "sonic"] },
  champion: { roles: ["martial", "divine", "armor", "shield"], any: ["armor", "shield", "reinforcing", "resilient", "healing", "divine", "talisman", "rune"] },
  cleric: { roles: ["caster", "divine", "wisdom"], any: ["staff", "wand", "scroll", "healing", "vitality", "divine", "religion", "holy"] },
  druid: { roles: ["caster", "primal", "wisdom"], any: ["staff", "wand", "scroll", "primal", "nature", "healing", "animal", "plant", "wood"] },
  fighter: { roles: ["martial", "weapon", "armor", "shield"], any: ["rune", "weapon", "striking", "potency", "armor", "shield", "reinforcing", "talisman"] },
  gunslinger: { roles: ["martial", "ranged", "skill"], any: ["rune", "weapon", "ammunition", "scope", "goggles", "talisman", "stealth", "acrobatics"] },
  inventor: { roles: ["martial", "crafting", "skill"], any: ["rune", "weapon", "armor", "crafting", "tools", "goggles", "clockwork", "gadget"] },
  investigator: { roles: ["skill", "ranged"], any: ["perception", "society", "medicine", "thievery", "stealth", "goggles", "lens", "tools", "elixir"] },
  kineticist: { roles: ["con", "impulse"], any: ["gate", "elemental", "fire", "water", "earth", "air", "wood", "metal", "healing", "talisman"] },
  magus: { roles: ["martial", "caster", "arcane"], any: ["rune", "weapon", "striking", "wand", "scroll", "arcane", "spellheart", "talisman"] },
  monk: { roles: ["martial", "unarmed", "mobility"], any: ["handwraps", "rune", "boots", "bracers", "belt", "acrobatic", "athletics", "talisman"] },
  oracle: { roles: ["caster", "divine", "charisma"], any: ["staff", "wand", "scroll", "divine", "healing", "curse", "religion", "vitality"] },
  psychic: { roles: ["caster", "occult", "charisma", "intelligence"], any: ["staff", "wand", "scroll", "occult", "mental", "illusion", "dream", "emotion", "deception"] },
  ranger: { roles: ["martial", "primal", "survival"], any: ["rune", "weapon", "bow", "crossbow", "boots", "cloak", "survival", "nature", "primal"] },
  rogue: { roles: ["martial", "skill", "dexterity"], any: ["rune", "weapon", "dagger", "shortsword", "thievery", "stealth", "deception", "boots", "cloak", "tools"] },
  sorcerer: { roles: ["caster", "charisma"], any: ["staff", "wand", "scroll", "spellheart", "robe", "ring", "amulet", "arcane", "divine", "occult", "primal"] },
  summoner: { roles: ["caster", "charisma", "eidolon"], any: ["staff", "wand", "scroll", "companion", "eidolon", "spellheart", "talisman"] },
  swashbuckler: { roles: ["martial", "skill", "dexterity", "charisma"], any: ["rune", "weapon", "rapier", "buckler", "acrobatics", "athletics", "deception", "diplomacy", "talisman"] },
  thaumaturge: { roles: ["martial", "esoterica", "charisma"], any: ["rune", "weapon", "esoterica", "occult", "religion", "talisman", "amulet", "implement"] },
  witch: { roles: ["caster"], any: ["staff", "wand", "scroll", "familiar", "grimoire", "hex", "arcane", "divine", "occult", "primal"] },
  wizard: { roles: ["caster", "arcane", "intelligence"], any: ["staff", "wand", "scroll", "arcane", "grimoire", "spellbook", "robe", "crown", "ring"] },
};

const ROLE_KEYWORDS = {
  martial: ["rune", "weapon", "striking", "potency", "armor", "shield", "talisman", "oil"],
  caster: ["staff", "wand", "scroll", "spellheart", "grimoire", "robe", "ring", "focus"],
  alchemical: ["alchemical", "elixir", "bomb", "mutagen", "antidote", "antiplague"],
  shield: ["shield", "reinforcing", "buckler"],
  armor: ["armor", "resilient", "fortification", "shadow", "slick"],
  weapon: ["weapon", "rune", "striking", "potency", "property rune"],
  skill: ["thievery", "stealth", "diplomacy", "deception", "intimidation", "medicine", "occultism", "arcana", "nature", "religion", "society", "survival", "athletics", "acrobatics", "performance", "crafting"],
  occult: ["occult", "mental", "emotion", "illusion", "dream", "fear"],
  divine: ["divine", "healing", "vitality", "holy", "spirit", "religion"],
  primal: ["primal", "nature", "healing", "animal", "plant", "wood", "fire", "water", "earth", "air"],
  arcane: ["arcane", "evocation", "illusion", "transmutation", "abjuration", "spellheart"],
};

const HYBRID_LOOT_STRATEGIES = [
  { id: "general", weight: 70, label: "general useful" },
  { id: "party", weight: 20, label: "party weighted" },
  { id: "spotlight", weight: 10, label: "spotlight" },
];

const SPOTLIGHT_SCORE_MULTIPLIER = 1.75;
const MAX_DUPLICATE_ROLE_WEIGHT = 3;

const cache = {
  ready: false,
  entries: [],
  docs: new Map(),
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
    hint: "Used only if the PF2e party actor, scene tokens, and player-owned characters do not resolve a session party. Default: Party.",
    type: String,
    default: "Party",
  });

  registerCuratedSetting("curatedSessionFraction", {
    name: "Session treasure fraction",
    hint: "How much of the official full-level treasure plan to sample on a session treasure roll. Default 0.25 means roughly four rewarding sessions per level.",
    type: Number,
    default: 0.25,
    range: { min: 0.05, max: 1, step: 0.05 },
  });

  registerCuratedSetting("curatedBudgetSlack", {
    name: "Budget slack",
    hint: "Soft over-budget allowance for curated item picks. 1.15 allows roughly 15% above the proportional Treasure by Level budget before candidates are rejected.",
    type: Number,
    default: 1.15,
    range: { min: 1, max: 2, step: 0.05 },
  });

  registerCuratedSetting("curatedAboveTableChance", {
    name: "Above-table permanent item chance",
    hint: "Chance for a permanent item slot to roll one level above the normal Treasure by Level slot, capped at party level +2 and still budget-filtered.",
    type: Number,
    default: 0.15,
    range: { min: 0, max: 0.5, step: 0.05 },
  });

  registerCuratedSetting("curatedUncommonWeight", {
    name: "Uncommon item weight",
    hint: "Weighted-pick multiplier for uncommon curated loot. Lower than 1 means uncommon items appear less often than common items while remaining possible.",
    type: Number,
    default: 0.45,
    range: { min: 0, max: 1, step: 0.05 },
  });

  registerCuratedSetting("curatedRareWeight", {
    name: "Rare item weight",
    hint: "Weighted-pick multiplier for rare curated loot. Rare items are allowed, but should be much less common than uncommon items.",
    type: Number,
    default: 0.12,
    range: { min: 0, max: 1, step: 0.01 },
  });

  registerCuratedSetting("curatedPartyWeight", {
    name: "Party relevance weight",
    hint: "Higher values make class/role matching dominate general-use item quality.",
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
});

Hooks.once("ready", () => {
  globalThis[API_NAME] = {
    rollSessionTreasure: (actor) => generateCuratedLoot(actor, { mode: "session" }),
    rollFullLevelTreasure: (actor) => generateCuratedLoot(actor, { mode: "full-level" }),
    rollOnePermanent: (actor) => generateCuratedLoot(actor, { mode: "one-permanent" }),
    getSessionParty,
    resolveSessionParty,
    getPartyContext: partyContext,
    preload: preloadCuratedIndex,
    scoreEntry,
  };
});

Hooks.on("getActorSheetHeaderButtons", (app, buttons) => {
  try {
    if (!game.settings.get(MODULE, "curatedEnabled")) return;
    const actor = app?.actor;
    if (!isLootActor(actor)) return;
    if (buttons.some(button => String(button.class ?? "").startsWith("pf2e-curated-"))) return;

    // Use the normal Foundry sheet header only. Injecting body buttons into
    // PF2e loot sheets creates oversized card-like buttons in some layouts.
    buttons.unshift(
      {
        label: "Session Treasure",
        class: "pf2e-curated-session-treasure",
        icon: "fas fa-gem",
        onclick: () => generateCuratedLoot(actor, { mode: "session" }),
      },
      {
        label: "Curated Full Level",
        class: "pf2e-curated-full-treasure",
        icon: "fas fa-wand-magic-sparkles",
        onclick: () => generateCuratedLoot(actor, { mode: "full-level" }),
      },
      {
        label: "One Permanent",
        class: "pf2e-curated-one-permanent",
        icon: "fas fa-hat-wizard",
        onclick: () => generateCuratedLoot(actor, { mode: "one-permanent" }),
      },
    );
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
  if (typeof value === "object") return Object.values(value);
  return [value];
}

function traitList(entryOrItem) {
  const traits = entryOrItem?.system?.traits;
  return [
    ...toArray(traits?.value),
    ...toArray(traits?.otherTags),
    traits?.rarity,
    entryOrItem?.system?.category,
    entryOrItem?.system?.consumableType?.value,
    entryOrItem?.system?.usage?.value,
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

function getSessionParty() {
  return resolveSessionParty().actors;
}

function resolveSessionParty() {
  const ignored = [];
  const candidateSources = [
    ["PF2e party actor", actorsFromPf2ePartyActor()],
    ["active scene player-owned character tokens", actorsFromSceneTokens()],
    ["player-owned character actors", actorsFromPlayerOwnedCharacters()],
    ["fallback Actor folder", actorsFromFallbackPartyFolder()],
  ];

  for (const [source, candidates] of candidateSources) {
    const filtered = filterPartyCandidates(candidates);
    ignored.push(...filtered.ignored.map(entry => ({ ...entry, source })));
    if (filtered.actors.length) return { source, actors: filtered.actors, ignored };
  }

  return { source: "no party found", actors: [], ignored };
}

function actorsFromPf2ePartyActor() {
  const partyActor = game.actors?.party ?? game.actors?.find?.(a => a?.type === "party");
  if (!partyActor) return [];

  const members = partyActor.members ?? partyActor.system?.members ?? partyActor.system?.details?.members ?? [];
  const CollectionClass = foundry?.utils?.Collection;
  const isCollection = typeof CollectionClass === "function" && members instanceof CollectionClass;
  const memberArray = isCollection ? Array.from(members.values()) : toArray(members);
  return memberArray.map(member => member?.actor ?? member).filter(Boolean);
}

function actorsFromSceneTokens() {
  if (!canvas?.ready) return [];
  return canvas.tokens.placeables
    .map(token => token.actor)
    .filter(actor => actor?.hasPlayerOwner);
}

function actorsFromPlayerOwnedCharacters() {
  return game.actors.filter(actor => actor?.type === "character" && actor?.hasPlayerOwner);
}

function actorsFromFallbackPartyFolder() {
  const folderName = game.settings.get(MODULE, "curatedPartyFolder") || "Party";
  const folders = Array.from(game.folders ?? []);
  const root = folders.find(folder => folder?.type === "Actor" && folder.name === folderName);
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

  return game.actors.filter(actor => folderIds.has(actor.folder?.id));
}

function filterPartyCandidates(candidates) {
  const actors = [];
  const ignored = [];
  const seen = new Set();

  for (const actor of candidates ?? []) {
    if (!actor || seen.has(actor.id)) continue;
    seen.add(actor.id);
    const reason = partyExclusionReason(actor);
    if (reason) ignored.push({ actor, reason });
    else actors.push(actor);
  }

  return { actors, ignored };
}

function partyExclusionReason(actor) {
  if (!actor) return "missing actor";
  if (actor.type === "familiar") return "actor type familiar";
  if (String(actor.type ?? "").toLowerCase().includes("companion")) return `actor type ${actor.type}`;
  if (actor.type !== "character") return `actor type ${actor.type}`;

  const master = actor.system?.master;
  if (master?.id || master?.uuid || master?.actor) return "has a master actor";

  const classSlug = actorClassSlug(actor);
  const hasClassItem = Boolean(classSlug);
  const creatureValue = actor.system?.details?.creature?.value;
  const hasCompanionAbility = Array.from(actor.items ?? []).some(item => {
    const category = String(item?.system?.category ?? "").toLowerCase();
    const source = String(item?._stats?.compendiumSource ?? "").toLowerCase();
    return category === "familiar" || category === "animal-companion" ||
      source.includes("familiar-abilities") || source.includes("animal-companion") ||
      source.includes("animal-companions");
  });

  if (hasCompanionAbility) return "familiar/companion ability set";
  if (!hasClassItem && creatureValue) return "creature-style character actor without a class";

  return null;
}

function partyContext() {
  const party = resolveSessionParty();
  const actors = party.actors;
  const levels = actors.map(a => Number(a.system?.details?.level?.value ?? 1)).filter(n => Number.isFinite(n) && n > 0);
  const level = clampLevel(levels.length ? levels.reduce((a, b) => a + b, 0) / levels.length : 1);
  const actorProfiles = actors.map(buildActorProfile).filter(Boolean);
  const classCounts = new Map();
  const roleCounts = new Map();
  const keywordCounts = new Map();
  const traditionCounts = new Map();

  for (const profile of actorProfiles) {
    if (profile.classSlug) incrementCounter(classCounts, profile.classSlug, 1);
    mergeCounter(roleCounts, profile.roles);
    mergeCounter(keywordCounts, profile.keywords);
    mergeCounter(traditionCounts, profile.traditions);
  }

  return {
    actors,
    ignored: party.ignored,
    partySource: party.source,
    level,
    partySize: actors.length || 4,
    classes: [...classCounts.keys()],
    classCounts,
    actorProfiles,
    roleCounts,
    keywordCounts,
    traditionCounts,
    // Backwards-compatible aliases for API/debug consumers.
    roles: roleCounts,
    keywords: keywordCounts,
    traditions: traditionCounts,
  };
}

function buildActorProfile(actor) {
  if (!actor) return null;
  const classSlug = actorClassSlug(actor);
  const roles = new Map();
  const keywords = new Map();
  const traditions = new Map();

  addClassProfileToCounters(classSlug, roles, keywords);

  for (const item of actor.items ?? []) {
    const type = item?.type;
    const slug = slugify(item?.slug ?? item?.name);
    if (type === "spellcastingEntry") {
      const tradition = item.system?.tradition?.value;
      if (tradition) {
        const key = String(tradition).toLowerCase();
        incrementCounter(traditions, key, 1);
        incrementCounter(roles, key, 1);
      }
    }
    if (type === "class" && slug !== classSlug && CLASS_PROFILES[slug]) addClassProfileToCounters(slug, roles, keywords);
  }

  return { actor, classSlug, roles, keywords, traditions };
}

function addClassProfileToCounters(classSlug, roleCounts, keywordCounts) {
  const profile = CLASS_PROFILES[classSlug];
  if (!profile) return;
  for (const role of profile.roles ?? []) incrementCounter(roleCounts, role, 1);
  for (const word of profile.any ?? []) incrementCounter(keywordCounts, word, 1);
}

function incrementCounter(counter, key, amount = 1) {
  const normalized = String(key ?? "").toLowerCase();
  if (!normalized) return;
  counter.set(normalized, (counter.get(normalized) ?? 0) + amount);
}

function mergeCounter(target, source, multiplier = 1) {
  for (const [key, value] of source ?? []) incrementCounter(target, key, value * multiplier);
}

function counterHas(counter, key) {
  return Number(counter?.get?.(key) ?? 0) > 0;
}

function duplicateWeight(count) {
  return Math.min(MAX_DUPLICATE_ROLE_WEIGHT, Math.max(0, Number(count) || 0));
}

function actorClassSlug(actor) {
  const classItem = actor?.itemTypes?.class?.[0] ?? Array.from(actor?.items ?? []).find(i => i.type === "class");
  return slugify(classItem?.slug ?? classItem?.name ?? actor?.class?.slug ?? actor?.system?.details?.class?.value);
}

function treasureTotalBudget(ctx, fraction = 1) {
  const baseTotal = TOTAL_VALUE_BY_LEVEL[ctx.level] ?? TOTAL_VALUE_BY_LEVEL[1];
  const extraPcs = Math.max(0, ctx.partySize - 4);
  // The official additional-PC guidance adds item slots plus currency. A quarter
  // of the four-PC total is a practical soft value for each extra PC's share.
  return Math.floor((baseTotal + extraPcs * (baseTotal / 4)) * fraction);
}

function stochasticCount(value, { min = 0 } = {}) {
  const whole = Math.floor(value);
  const fractional = value - whole;
  return Math.max(min, whole + (Math.random() < fractional ? 1 : 0));
}

function maybeAboveTablePermanentLevel(level, ctx) {
  const chance = Math.max(0, Math.min(0.5, Number(game.settings.get(MODULE, "curatedAboveTableChance")) || 0));
  if (chance <= 0 || Math.random() >= chance) return level;
  return Math.min(20, ctx.level + 2, level + 1);
}

function expandSlots(obj) {
  const slots = [];
  for (const [level, count] of Object.entries(obj ?? {})) {
    for (let i = 0; i < (Number(count) || 0); i++) slots.push(Number(level));
  }
  return slots;
}

function collapseSlots(levels) {
  const counts = new Map();
  for (const level of levels) counts.set(level, (counts.get(level) ?? 0) + 1);
  return [...counts.entries()].map(([level, count]) => ({ level, count }));
}

function sampleSlots(levels, fraction, { minimum = 0 } = {}) {
  if (!levels.length) return [];
  const shuffled = [...levels].sort(() => Math.random() - 0.5);
  const wanted = stochasticCount(levels.length * fraction, { min: minimum });
  return shuffled.slice(0, Math.min(levels.length, wanted));
}

function selectionPlan(ctx, mode) {
  const spec = TREASURE_BY_LEVEL[ctx.level] ?? TREASURE_BY_LEVEL[1];
  const extraPcs = Math.max(0, ctx.partySize - 4);
  const fraction = Math.max(0.05, Math.min(1, Number(game.settings.get(MODULE, "curatedSessionFraction")) || 0.25));

  if (mode === "one-permanent") {
    const level = maybeAboveTablePermanentLevel(Math.min(20, ctx.level + 1), ctx);
    return {
      permanent: [{ level, count: 1 }],
      consumable: [],
      currency: 0,
      softBudget: treasureTotalBudget(ctx, fraction),
      budgetFraction: fraction,
    };
  }

  const permanentLevels = expandSlots(spec.permanent);
  const consumableLevels = expandSlots(spec.consumable);
  for (let i = 0; i < extraPcs; i++) {
    permanentLevels.push(Math.min(20, ctx.level + (Math.random() < 0.5 ? 1 : 0)));
    consumableLevels.push(Math.min(20, ctx.level + 1), ctx.level);
  }

  if (mode === "full-level") {
    return {
      permanent: collapseSlots(permanentLevels.map(level => maybeAboveTablePermanentLevel(level, ctx))),
      consumable: collapseSlots(consumableLevels),
      currency: spec.currency + (extraPcs * spec.extraPc),
      softBudget: treasureTotalBudget(ctx, 1),
      budgetFraction: 1,
    };
  }

  // Session mode samples a proportional slice of the full-level item slots.
  // This preserves PF2e's item/currency shape, but lets a 5-PC party naturally
  // roll a second permanent item about 25% of the time at the default 0.25 slice.
  const sampledPermanent = sampleSlots(permanentLevels, fraction, { minimum: 1 })
    .map(level => maybeAboveTablePermanentLevel(level, ctx));
  const sampledConsumable = sampleSlots(consumableLevels, fraction, { minimum: 2 });

  return {
    permanent: collapseSlots(sampledPermanent),
    consumable: collapseSlots(sampledConsumable),
    currency: Math.floor((spec.currency + extraPcs * spec.extraPc) * fraction),
    softBudget: treasureTotalBudget(ctx, fraction),
    budgetFraction: fraction,
  };
}

function objectSlots(obj) {
  return Object.entries(obj ?? {}).map(([level, count]) => ({ level: Number(level), count: Number(count) || 0 }));
}

async function preloadCuratedIndex() {
  if (cache.ready) return cache.entries;
  const packSetting = game.settings.get(MODULE, "pack-equipment") || "pf2e.equipment-srd";
  const packIds = String(packSetting).split(",").map(s => s.trim()).filter(Boolean);
  const fields = [
    "type", "name", "system.level.value", "system.price.value", "system.price.per",
    "system.traits", "system.category", "system.consumableType.value", "system.usage.value",
    "system.slug", "img"
  ];

  const entries = [];
  for (const packId of packIds) {
    const pack = game.packs.get(packId);
    if (!pack) {
      console.warn(`${MODULE}: curated loot missing compendium ${packId}`);
      continue;
    }
    const index = await pack.getIndex({ fields });
    for (const entry of index) entries.push({ ...entry, __pack: packId });
  }
  cache.entries = entries;
  cache.ready = true;
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

function rarityWeightMultiplier(entry) {
  const traits = traitList(entry);
  if (traits.includes("unique")) return 0;
  if (traits.includes("rare")) return Math.max(0, Number(game.settings.get(MODULE, "curatedRareWeight")) || 0);
  if (traits.includes("uncommon")) return Math.max(0, Number(game.settings.get(MODULE, "curatedUncommonWeight")) || 0);
  return 1;
}

function isQuestLikeOrBlockedRarity(entry) {
  const traits = traitList(entry);
  if (traits.includes("unique")) return true;

  const blob = textBlob(entry);
  if (/\b(contract|pact|boon|curse|cursed|artifact|relic|story|quest)\b/.test(blob)) return true;

  return false;
}

function isZeroValueOrQuestLike(entry) {
  // PF2e equipment compendia contain campaign/quest objects, boons, contracts,
  // and other non-purchasable records. These often have no listed price or 0 gp
  // and are bad random-chest rewards even when their item type is "equipment."
  if (priceToGP(entry) <= 0) return true;
  return isQuestLikeOrBlockedRarity(entry);
}

function isUsefulPermanent(entry) {
  if (!["equipment", "weapon", "armor", "shield"].includes(entry?.type)) return false;
  if (isJunk(entry) || isZeroValueOrQuestLike(entry)) return false;
  const blob = textBlob(entry);
  const traits = traitList(entry);
  const magical = ["magical", "invested", "arcane", "divine", "occult", "primal", "focused", "rune"].some(t => traits.includes(t));
  const usefulName = COMMON_PERMANENT_KEYWORDS.some(word => blob.includes(word));
  const mundaneWeaponOrArmor = ["weapon", "armor", "shield"].includes(entry.type) && !magical && !blob.includes("rune");
  return (magical || usefulName) && !mundaneWeaponOrArmor;
}

function isUsefulConsumable(entry, ctx) {
  if (entry?.type !== "consumable") return false;
  if (isJunk(entry) || isZeroValueOrQuestLike(entry)) return false;
  const blob = textBlob(entry);
  const traits = traitList(entry);
  const hasUsefulTrait = ["potion", "elixir", "scroll", "oil", "talisman", "fulu", "mutagen", "bomb", "catalyst", "magical", "alchemical"].some(t => traits.includes(t));
  const usefulName = COMMON_CONSUMABLE_KEYWORDS.some(word => blob.includes(word));
  const isPoison = traits.includes("poison") || blob.includes("poison");
  const hasPoisonUser = counterHas(ctx.roleCounts, "alchemical") || ctx.classes.includes("rogue") || ctx.classes.includes("alchemist");
  if (isPoison && !hasPoisonUser) return false;
  return hasUsefulTrait || usefulName;
}

function scoreEntry(entry, ctx, kind, targetLevel, strategy = { id: "party", label: "party weighted" }) {
  const blob = textBlob(entry);
  const traits = traitList(entry);
  let score = 1;

  // Level proximity: prefer exact level, tolerate near misses if the exact pool is thin.
  const levelDistance = Math.abs(entryLevel(entry) - targetLevel);
  score += Math.max(0, 6 - levelDistance * 2);

  const keywordList = kind === "permanent" ? COMMON_PERMANENT_KEYWORDS : COMMON_CONSUMABLE_KEYWORDS;
  for (const word of keywordList) if (blob.includes(word)) score += 2;

  // Rarity should influence probability, not act as a hard ban.
  // Common remains the default. Uncommon and rare stay possible but are
  // increasingly down-weighted by rarityWeightMultiplier() at the end.
  if (traits.includes("common")) score += 1;
  if (traits.includes("uncommon")) score += 0;
  if (traits.includes("rare")) score -= 1;
  if (traits.includes("unique")) score -= 999;
  if (priceToGP(entry) <= 0 || isQuestLikeOrBlockedRarity(entry)) score -= 999;

  if (kind === "permanent") {
    if (traits.includes("invested")) score += 3;
    if (traits.includes("rune") || blob.includes("rune")) score += 5;
    if (blob.includes("weapon potency") || blob.includes("striking") || blob.includes("resilient") || blob.includes("reinforcing")) score += 6;
    if (blob.includes("spacious pouch") || blob.includes("bag of holding")) score += 4;
  } else {
    if (blob.includes("elixir of life") || blob.includes("healing potion") || blob.includes("healing")) score += 7;
    if (blob.includes("scroll") && counterHas(ctx.roleCounts, "caster")) score += 5;
    if (blob.includes("wand") && counterHas(ctx.roleCounts, "caster")) score += 5;
    if (blob.includes("bomb") && counterHas(ctx.roleCounts, "alchemical")) score += 4;
  }

  const partyWeight = Number(game.settings.get(MODULE, "curatedPartyWeight")) || 0;
  if (partyWeight > 0 && strategy?.id !== "general") {
    if (strategy?.id === "spotlight" && strategy.profile) {
      score += relevanceScore(blob, traits, strategy.profile, partyWeight * SPOTLIGHT_SCORE_MULTIPLIER);
    } else {
      score += relevanceScore(blob, traits, ctx, partyWeight);
    }
  }

  // Avoid traps that are technically useful but often become vendor clutter in a rotating West Marches party.
  for (const narrow of ["underwater", "aquatic", "vehicle", "siege", "structure", "curse", "cursed"]) {
    if (blob.includes(narrow)) score -= 3;
  }

  const rarityMultiplier = rarityWeightMultiplier(entry);
  if (rarityMultiplier <= 0) return 0;

  return Math.max(0.01, score) * rarityMultiplier * (0.85 + Math.random() * 0.3);
}

function relevanceScore(blob, traits, profileOrContext, partyWeight) {
  let score = 0;
  const roleCounts = profileOrContext.roleCounts ?? profileOrContext.roles ?? new Map();
  const keywordCounts = profileOrContext.keywordCounts ?? profileOrContext.keywords ?? new Map();
  const traditionCounts = profileOrContext.traditionCounts ?? profileOrContext.traditions ?? new Map();

  for (const [role, count] of roleCounts) {
    const weight = partyWeight * duplicateWeight(count);
    for (const word of ROLE_KEYWORDS[role] ?? []) {
      if (blob.includes(word)) score += weight;
    }
  }

  for (const [word, count] of keywordCounts) {
    if (blob.includes(word)) score += partyWeight * duplicateWeight(count);
  }

  for (const [tradition, count] of traditionCounts) {
    if (traits.includes(tradition) || blob.includes(tradition)) score += partyWeight * 1.5 * duplicateWeight(count);
  }

  return score;
}

function chooseLootStrategy(ctx, mode) {
  if (mode === "one-permanent" && ctx.actorProfiles.length) return spotlightStrategy(ctx) ?? strategyById("party");

  const total = HYBRID_LOOT_STRATEGIES.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const strategy of HYBRID_LOOT_STRATEGIES) {
    roll -= strategy.weight;
    if (roll <= 0) {
      if (strategy.id === "spotlight") return spotlightStrategy(ctx) ?? strategyById("party");
      return strategy;
    }
  }
  return strategyById("general");
}

function strategyById(id) {
  return HYBRID_LOOT_STRATEGIES.find(strategy => strategy.id === id) ?? HYBRID_LOOT_STRATEGIES[0];
}

function spotlightStrategy(ctx) {
  if (!ctx.actorProfiles.length) return null;
  const profile = ctx.actorProfiles[Math.floor(Math.random() * ctx.actorProfiles.length)];
  const classLabel = profile.classSlug ? ` ${profile.classSlug}` : "";
  return {
    ...strategyById("spotlight"),
    profile,
    label: `spotlight:${classLabel || " character"}`,
  };
}

function strategyLabel(strategy) {
  if (!strategy) return "general useful";
  if (strategy.id !== "spotlight") return strategy.label;
  const actorName = strategy.profile?.actor?.name;
  const classSlug = strategy.profile?.classSlug;
  if (actorName && classSlug) return `spotlight ${actorName} (${classSlug})`;
  if (actorName) return `spotlight ${actorName}`;
  if (classSlug) return `spotlight ${classSlug}`;
  return "spotlight";
}

function weightedPick(pool, scoreFn, alreadyPicked) {
  const candidates = pool.filter(e => !alreadyPicked.has(`${e.__pack}:${e._id}`));
  if (!candidates.length) return null;
  const weights = candidates.map(scoreFn);
  const total = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0);
  if (total <= 0) return candidates[Math.floor(Math.random() * candidates.length)];
  let roll = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

function poolFor(entries, ctx, kind, targetLevel) {
  const predicate = kind === "permanent" ? isUsefulPermanent : (entry) => isUsefulConsumable(entry, ctx);
  let radius = 0;
  let pool = [];
  while (radius <= 3 && pool.length < 5) {
    pool = entries.filter(entry => predicate(entry) && Math.abs(entryLevel(entry) - targetLevel) <= radius);
    radius += 1;
  }
  return pool;
}

function budgetSlack() {
  return Math.max(1, Number(game.settings.get(MODULE, "curatedBudgetSlack")) || 1.15);
}

function pickBudgeted(pool, scoreFn, pickedKeys, plan, currentItemValue) {
  const softCap = Number(plan.softBudget) || 0;
  if (softCap <= 0) return weightedPick(pool, scoreFn, pickedKeys);

  const hardCap = softCap * budgetSlack();
  const budgetedPool = pool.filter(entry => currentItemValue + priceToGP(entry) <= hardCap);
  const selected = weightedPick(budgetedPool, scoreFn, pickedKeys);
  if (selected) return selected;

  // Fallback: if the pool is thin, allow one over-budget useful item rather than
  // returning nothing. Currency is reduced later to compensate when possible.
  return weightedPick(pool, scoreFn, pickedKeys);
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

  for (const slot of plan.permanent) {
    for (let i = 0; i < slot.count; i++) {
      const strategy = chooseLootStrategy(ctx, mode);
      const pool = poolFor(entries, ctx, "permanent", slot.level);
      const entry = pickBudgeted(pool, e => scoreEntry(e, ctx, "permanent", slot.level, strategy), pickedKeys, plan, itemValue);
      if (!entry) continue;
      pickedKeys.add(`${entry.__pack}:${entry._id}`);
      itemValue += priceToGP(entry);
      const raw = await rawItem(entry);
      if (raw) {
        toCreate.push(raw);
        summary.push(`Permanent ${entryLevel(entry)}: ${entry.name} <em>(${strategyLabel(strategy)})</em>`);
      }
    }
  }

  for (const slot of plan.consumable) {
    for (let i = 0; i < slot.count; i++) {
      const strategy = chooseLootStrategy(ctx, mode);
      const pool = poolFor(entries, ctx, "consumable", slot.level);
      const entry = pickBudgeted(pool, e => scoreEntry(e, ctx, "consumable", slot.level, strategy), pickedKeys, plan, itemValue);
      if (!entry) continue;
      pickedKeys.add(`${entry.__pack}:${entry._id}`);
      itemValue += priceToGP(entry);
      const raw = await rawItem(entry);
      if (raw) {
        toCreate.push(raw);
        summary.push(`Consumable ${entryLevel(entry)}: ${entry.name} <em>(${strategyLabel(strategy)})</em>`);
      }
    }
  }

  let currencyToAdd = plan.currency;
  if (plan.softBudget > 0 && itemValue + currencyToAdd > plan.softBudget) {
    currencyToAdd = Math.max(0, Math.floor(plan.softBudget - itemValue));
  }

  if (toCreate.length) await actor.createEmbeddedDocuments("Item", toCreate);
  if (currencyToAdd > 0) {
    await addCurrencyGP(actor, currencyToAdd);
    summary.push(`Currency: ${currencyToAdd} gp equivalent`);
  }
  summary.push(`Budget: item value ${Math.round(itemValue * 100) / 100} gp + currency ${currencyToAdd} gp / soft cap ${plan.softBudget} gp`);

  const names = ctx.actors.map(a => a.name).join(", ") || "fallback party";
  const ignoredNames = (ctx.ignored ?? []).map(entry => `${entry.actor?.name ?? "Unknown"} (${entry.reason})`);
  const classText = [...(ctx.classCounts ?? new Map()).entries()].map(([name, count]) => `${name} ×${count}`).join(", ") || "none";
  const ignoredText = ignoredNames.length ? `<br><strong>Ignored non-PC actors:</strong> ${ignoredNames.join(", ")}` : "";
  const content = `<h3>Curated Loot Generated</h3><p><strong>Mode:</strong> ${mode}<br><strong>Party source:</strong> ${ctx.partySource}<br><strong>Party:</strong> ${names}<br><strong>Average Level:</strong> ${ctx.level}<br><strong>Class profile:</strong> ${classText}${ignoredText}</p><ul>${summary.map(s => `<li>${s}</li>`).join("")}</ul>`;
  ChatMessage.create({ content, whisper: ChatMessage.getWhisperRecipients("GM") });
  ui.notifications?.info(`Curated loot generated: ${summary.length} reward entries.`);
}

async function rawItem(entry) {
  const doc = await getDoc(entry);
  if (!doc) return null;
  const raw = doc.toObject();
  delete raw._id;
  raw.system = raw.system ?? {};
  raw.system.quantity = 1;
  raw.flags = raw.flags ?? {};
  raw.flags[MODULE] = {
    ...(raw.flags[MODULE] ?? {}),
    curated: true,
    source: { pack: entry.__pack, id: entry._id },
  };
  return raw;
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
  const inv = actor?.inventory;
  try {
    const Coins = inv?.coins?.constructor?.fromObject ? inv.coins.constructor : game?.pf2e?.Coins;
    const coins = Coins?.fromObject ? Coins.fromObject(currency) : currency;
    if (inv?.addCurrency) return await inv.addCurrency(coins);
    if (inv?.addCoins) return await inv.addCoins(coins);
  } catch (error) {
    console.warn(`${MODULE}: PF2e coin API failed; falling back to actor update`, error);
  }

  const path = actor?.system?.currency ? "system.currency" : "system.currency";
  const existing = foundry.utils.getProperty(actor, path) ?? {};
  const update = {};
  for (const [key, value] of Object.entries(currency)) {
    const current = existing?.[key];
    if (current && typeof current === "object" && "value" in current) update[`${path}.${key}.value`] = (Number(current.value) || 0) + value;
    else update[`${path}.${key}`] = (Number(current) || 0) + value;
  }
  return actor.update(update);
}
