import { useMemo, useState } from 'react'
import {
  Swords,
  UserRound,
  Shirt,
  Shield,
  ClipboardList,
  Settings2,
  Hand,
  Gem,
  Wand2,
  Sparkles,
  TriangleAlert,
  Search,
  X,
  Feather,
  Footprints,
  Weight,
  AlertTriangle,
  Lock,
  Check,
  type LucideIcon,
} from 'lucide-react'
import { EldenRingOptimizer } from './EldenRingOptimizer';

/* ===========================================================================
 * Data & calculations (was lib/eldenring.ts)
 * =========================================================================== */

/* =========================================================================
 * Elden Ring build optimizer — data + calculations
 *
 * All game data below is a LOCAL sample dataset (no API / no external JSON).
 * Paste your full / DLC datasets into SAMPLE_WEAPONS and SAMPLE_ARMORS,
 * keeping the same shape, and everything else keeps working.
 * ========================================================================= */

export type StatKey = 'vig' | 'min' | 'end' | 'str' | 'dex' | 'int' | 'fai' | 'arc'

export const STAT_META: { key: StatKey; label: string; short: string }[] = [
  { key: 'vig', label: 'Vigor', short: 'Vig' },
  { key: 'min', label: 'Mind', short: 'Min' },
  { key: 'end', label: 'Endurance', short: 'End' },
  { key: 'str', label: 'Strength', short: 'Str' },
  { key: 'dex', label: 'Dexterity', short: 'Dex' },
  { key: 'int', label: 'Intelligence', short: 'Int' },
  { key: 'fai', label: 'Faith', short: 'Fai' },
  { key: 'arc', label: 'Arcane', short: 'Arc' },
]

export type Stats = Record<StatKey, number>

/* ---------- Starting classes (minimum stat floors) ---------- */

export type StartingClass =
  | 'Wretch'
  | 'Vagabond'
  | 'Warrior'
  | 'Hero'
  | 'Bandit'
  | 'Astrologer'
  | 'Prophet'
  | 'Confessor'
  | 'Samurai'
  | 'Prisoner'

// Each class's starting attributes act as the minimum floor for that build.
export const CLASSES: Record<StartingClass, Stats> = {
  Wretch: { vig: 10, min: 10, end: 10, str: 10, dex: 10, int: 10, fai: 10, arc: 10 },
  Vagabond: { vig: 15, min: 10, end: 11, str: 14, dex: 13, int: 9, fai: 9, arc: 7 },
  Warrior: { vig: 11, min: 12, end: 11, str: 10, dex: 16, int: 10, fai: 8, arc: 9 },
  Hero: { vig: 14, min: 9, end: 12, str: 16, dex: 9, int: 7, fai: 8, arc: 11 },
  Bandit: { vig: 10, min: 11, end: 10, str: 9, dex: 13, int: 9, fai: 8, arc: 14 },
  Astrologer: { vig: 9, min: 15, end: 9, str: 8, dex: 12, int: 16, fai: 7, arc: 9 },
  Prophet: { vig: 10, min: 14, end: 8, str: 11, dex: 10, int: 7, fai: 16, arc: 10 },
  Confessor: { vig: 10, min: 13, end: 10, str: 12, dex: 12, int: 9, fai: 14, arc: 9 },
  Samurai: { vig: 12, min: 11, end: 13, str: 12, dex: 15, int: 9, fai: 8, arc: 8 },
  Prisoner: { vig: 11, min: 12, end: 11, str: 11, dex: 14, int: 14, fai: 6, arc: 9 },
}

export const CLASS_NAMES = Object.keys(CLASSES) as StartingClass[]

export const DEFAULT_CLASS: StartingClass = 'Vagabond'
export const DEFAULT_STATS: Stats = { ...CLASSES[DEFAULT_CLASS] }

/* ---------- Types ---------- */

export type Requirement = { stat: StatKey; amount: number }
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'E'
export type Scaling = { stat: StatKey; grade: Grade }

export type Weapon = {
  id: string
  name: string
  category: string
  weight: number
  baseAttack: number
  requirements: Requirement[]
  scaling: Scaling[]
}

export type ArmorSlot = 'head' | 'chest' | 'hands' | 'legs'

export const ARMOR_SLOTS: { key: ArmorSlot; label: string }[] = [
  { key: 'head', label: 'Helm' },
  { key: 'chest', label: 'Chest' },
  { key: 'hands', label: 'Gauntlets' },
  { key: 'legs', label: 'Greaves' },
]

export type Armor = {
  id: string
  name: string
  slot: ArmorSlot
  weight: number
  physNeg: number // physical damage negation %
  poise: number
}

/* ---------- Sample local dataset (paste full data here) ---------- */

export const SAMPLE_WEAPONS: Weapon[] = [
  // --- Vagabond Starter ---
  {
    id: 'longsword',
    name: 'Longsword',
    category: 'Straight Sword',
    weight: 3.0,
    baseAttack: 110,
    requirements: [
      { stat: 'str', amount: 10 },
      { stat: 'dex', amount: 10 },
    ],
    scaling: [
      { stat: 'str', grade: 'D' },
      { stat: 'dex', grade: 'D' },
    ],
  },
  // --- Warrior Starter ---
  {
    id: 'scimitar',
    name: 'Scimitar',
    category: 'Curved Sword',
    weight: 3.0,
    baseAttack: 106,
    requirements: [
      { stat: 'str', amount: 7 },
      { stat: 'dex', amount: 13 },
    ],
    scaling: [
      { stat: 'str', grade: 'D' },
      { stat: 'dex', grade: 'D' },
    ],
  },
  // --- Hero Starter ---
  {
    id: 'battle-axe',
    name: 'Battle Axe',
    category: 'Axe',
    weight: 4.5,
    baseAttack: 123,
    requirements: [
      { stat: 'str', amount: 12 },
      { stat: 'dex', amount: 8 },
    ],
    scaling: [
      { stat: 'str', grade: 'D' },
      { stat: 'dex', grade: 'D' },
    ],
  },
  // --- Bandit Starter ---
  {
    id: 'great-knife',
    name: 'Great Knife',
    category: 'Dagger',
    weight: 1.5,
    baseAttack: 75,
    requirements: [
      { stat: 'str', amount: 6 },
      { stat: 'dex', amount: 12 },
    ],
    scaling: [
      { stat: 'str', grade: 'E' },
      { stat: 'dex', grade: 'C' },
    ],
  },
  // --- Astrologer Starter ---
  {
    id: 'short-sword',
    name: 'Short Sword',
    category: 'Straight Sword',
    weight: 3.0,
    baseAttack: 102,
    requirements: [
      { stat: 'str', amount: 8 },
      { stat: 'dex', amount: 10 },
    ],
    scaling: [
      { stat: 'str', grade: 'D' },
      { stat: 'dex', grade: 'D' },
    ],
  },
  // --- Prophet Starter ---
  {
    id: 'short-spear',
    name: 'Short Spear',
    category: 'Spear',
    weight: 4.0,
    baseAttack: 112,
    requirements: [
      { stat: 'str', amount: 10 },
      { stat: 'dex', amount: 10 },
    ],
    scaling: [
      { stat: 'str', grade: 'D' },
      { stat: 'dex', grade: 'D' },
    ],
  },
  // --- Confessor Starter ---
  {
    id: 'broadsword',
    name: 'Broadsword',
    category: 'Straight Sword',
    weight: 4.0,
    baseAttack: 117,
    requirements: [
      { stat: 'str', amount: 10 },
      { stat: 'dex', amount: 10 },
    ],
    scaling: [
      { stat: 'str', grade: 'D' },
      { stat: 'dex', grade: 'E' },
    ],
  },
  // --- Samurai Starter ---
  {
    id: 'uchigatana',
    name: 'Uchigatana',
    category: 'Katana',
    weight: 5.5,
    baseAttack: 115,
    requirements: [
      { stat: 'str', amount: 11 },
      { stat: 'dex', amount: 15 },
    ],
    scaling: [
      { stat: 'str', grade: 'D' },
      { stat: 'dex', grade: 'D' },
    ],
  },
  // --- Prisoner Starter ---
  {
    id: 'estoc',
    name: 'Estoc',
    category: 'Thrusting Sword',
    weight: 3.0,
    baseAttack: 107,
    requirements: [
      { stat: 'str', amount: 11 },
      { stat: 'dex', amount: 13 },
    ],
    scaling: [
      { stat: 'str', grade: 'E' },
      { stat: 'dex', grade: 'C' },
    ],
  },
  // --- Wretch Starter ---
  {
    id: 'club',
    name: 'Club',
    category: 'Hammer',
    weight: 3.5,
    baseAttack: 103,
    requirements: [
      { stat: 'str', amount: 10 },
    ],
    scaling: [
      { stat: 'str', grade: 'C' },
    ],
  },
  // --- Extras ---
  {
    id: 'greatsword',
    name: 'Greatsword',
    category: 'Colossal Sword',
    weight: 23.0,
    baseAttack: 168,
    requirements: [
      { stat: 'str', amount: 31 },
      { stat: 'dex', amount: 12 },
    ],
    scaling: [
      { stat: 'str', grade: 'C' },
      { stat: 'dex', grade: 'E' },
    ],
  },
  {
    id: 'moonveil',
    name: 'Moonveil',
    category: 'Katana',
    weight: 6.5,
    baseAttack: 108,
    requirements: [
      { stat: 'str', amount: 12 },
      { stat: 'dex', amount: 18 },
      { stat: 'int', amount: 23 },
    ],
    scaling: [
      { stat: 'str', grade: 'E' },
      { stat: 'dex', grade: 'D' },
      { stat: 'int', grade: 'C' },
    ],
  },
  {
    id: 'blasphemous-blade',
    name: 'Blasphemous Blade',
    category: 'Greatsword',
    weight: 10.0,
    baseAttack: 117,
    requirements: [
      { stat: 'str', amount: 22 },
      { stat: 'dex', amount: 15 },
      { stat: 'fai', amount: 21 },
    ],
    scaling: [
      { stat: 'str', grade: 'D' },
      { stat: 'dex', grade: 'E' },
      { stat: 'fai', grade: 'D' },
    ],
  }
]
export const SAMPLE_ARMORS: Armor[] = [
  // --- head ---
  { id: 'vagabond-knight-helm', name: 'Vagabond Knight Helm', slot: 'head', weight: 4, physNeg: 4, poise: 4 },
  { id: 'blue-cloth-cowl', name: 'Blue Cloth Cowl', slot: 'head', weight: 2.7, physNeg: 2, poise: 1 },
  { id: 'champion-headband', name: 'Champion Headband', slot: 'head', weight: 2.7, physNeg: 2, poise: 2 },
  { id: 'bandit-mask', name: 'Bandit Mask', slot: 'head', weight: 3, physNeg: 2, poise: 1 },
  { id: 'astrologer-hood', name: 'Astrologer Hood', slot: 'head', weight: 1.7, physNeg: 1, poise: 1 },
  { id: 'prophet-blindfold', name: 'Prophet Blindfold', slot: 'head', weight: 1, physNeg: 0, poise: 0 },
  { id: 'land-of-reeds-helm', name: 'Land of Reeds Helm', slot: 'head', weight: 3.6, physNeg: 3, poise: 2 },
  { id: 'prisoner-iron-mask', name: 'Prisoner Iron Mask', slot: 'head', weight: 8.6, physNeg: 6, poise: 11 },
  { id: 'confessor-hood', name: 'Confessor Hood', slot: 'head', weight: 3.3, physNeg: 2, poise: 2 },
  // --- chest ---
  { id: 'vagabond-knight-armor', name: 'Vagabond Knight Armor', slot: 'chest', weight: 10.6, physNeg: 13, poise: 15 },
  { id: 'blue-cloth-vest', name: 'Blue Cloth Vest', slot: 'chest', weight: 7.7, physNeg: 9, poise: 6 },
  { id: 'champion-pauldron', name: 'Champion Pauldron', slot: 'chest', weight: 5.1, physNeg: 6, poise: 3 },
  { id: 'bandit-garb', name: 'Bandit Garb', slot: 'chest', weight: 7.7, physNeg: 8, poise: 5 },
  { id: 'astrologer-robe', name: 'Astrologer Robe', slot: 'chest', weight: 6.3, physNeg: 6, poise: 5 },
  { id: 'prophet-robe', name: 'Prophet Robe', slot: 'chest', weight: 5.1, physNeg: 6, poise: 2 },
  { id: 'land-of-reeds-armor', name: 'Land of Reeds Armor', slot: 'chest', weight: 8.3, physNeg: 8, poise: 6 },
  { id: 'prisoner-clothing', name: 'Prisoner Clothing', slot: 'chest', weight: 3.2, physNeg: 4, poise: 1 },
  { id: 'confessor-armor', name: 'Confessor Armor', slot: 'chest', weight: 8.3, physNeg: 8, poise: 6 },
  // --- arms ---
  { id: 'vagabond-knight-gauntlets', name: 'Vagabond Knight Gauntlets', slot: 'hands', weight: 3.5, physNeg: 3, poise: 3 },
  { id: 'warrior-gauntlets', name: 'Warrior Gauntlets', slot: 'hands', weight: 2.6, physNeg: 2, poise: 1 },
  { id: 'champion-bracers', name: 'Champion Bracers', slot: 'hands', weight: 2.1, physNeg: 1, poise: 1 },
  { id: 'bandit-manchettes', name: 'Bandit Manchettes', slot: 'hands', weight: 1, physNeg: 1, poise: 0 },
  { id: 'astrologer-gloves', name: 'Astrologer Gloves', slot: 'hands', weight: 1.4, physNeg: 1, poise: 1 },
  { id: 'land-of-reeds-gauntlets', name: 'Land of Reeds Gauntlets', slot: 'hands', weight: 2.8, physNeg: 2, poise: 1 },
  { id: 'confessor-gloves', name: 'Confessor Gloves', slot: 'hands', weight: 2.8, physNeg: 2, poise: 1 },
  // --- legs ---
  { id: 'vagabond-knight-greaves', name: 'Vagabond Knight Greaves', slot: 'legs', weight: 5.7, physNeg: 7, poise: 8 },
  { id: 'warrior-greaves', name: 'Warrior Greaves', slot: 'legs', weight: 4.8, physNeg: 5, poise: 4 },
  { id: 'champion-gaiters', name: 'Champion Gaiters', slot: 'legs', weight: 3.9, physNeg: 4, poise: 3 },
  { id: 'bandit-boots', name: 'Bandit Boots', slot: 'legs', weight: 4.4, physNeg: 4, poise: 2 },
  { id: 'astrologer-trousers', name: 'Astrologer Trousers', slot: 'legs', weight: 3.9, physNeg: 3, poise: 3 },
  { id: 'prophet-trousers', name: 'Prophet Trousers', slot: 'legs', weight: 3.1, physNeg: 3, poise: 1 },
  { id: 'land-of-reeds-greaves', name: 'Land of Reeds Greaves', slot: 'legs', weight: 5.1, physNeg: 5, poise: 4 },
  { id: 'prisoner-trousers', name: 'Prisoner Trousers', slot: 'legs', weight: 2, physNeg: 2, poise: 1 },
  { id: 'confessor-boots', name: 'Confessor Boots', slot: 'legs', weight: 4.8, physNeg: 4, poise: 3 },
]

export const WEAPONS = SAMPLE_WEAPONS
export const ARMORS = SAMPLE_ARMORS

export const WEAPON_CATEGORIES = Array.from(
  new Set(WEAPONS.map((w) => w.category)),
).sort()

/* ---------- Affinities / infusions ---------- */

export type Affinity =
  | 'Standard'
  | 'Heavy'
  | 'Keen'
  | 'Quality'
  | 'Magic'
  | 'Sacred'
  | 'Occult'

export const AFFINITIES: Affinity[] = [
  'Standard',
  'Heavy',
  'Keen',
  'Quality',
  'Magic',
  'Sacred',
  'Occult',
]

// Each infusion tweaks base damage and redistributes scaling.
// `Standard` keeps the weapon's innate scaling.
const AFFINITY_PROFILE: Record<
  Affinity,
  { baseMult: number; scaling: Partial<Record<StatKey, Grade>> | null }
> = {
  Standard: { baseMult: 1.0, scaling: null },
  Heavy: { baseMult: 1.0, scaling: { str: 'A' } },
  Keen: { baseMult: 1.0, scaling: { dex: 'A' } },
  Quality: { baseMult: 0.95, scaling: { str: 'C', dex: 'C' } },
  Magic: { baseMult: 0.9, scaling: { int: 'B', str: 'E' } },
  Sacred: { baseMult: 0.9, scaling: { fai: 'B', str: 'E' } },
  Occult: { baseMult: 0.95, scaling: { arc: 'B', dex: 'E' } },
}

export function effectiveScaling(weapon: Weapon, affinity: Affinity): Scaling[] {
  const profile = AFFINITY_PROFILE[affinity]
  if (!profile.scaling) return weapon.scaling
  return (Object.entries(profile.scaling) as [StatKey, Grade][]).map(
    ([stat, grade]) => ({ stat, grade }),
  )
}

/* ---------- Two-handing ---------- */

// Two-handing multiplies Strength by 1.5x (capped at 99) for both
// requirement checks and scaling calculations.
export function effectiveStats(stats: Stats, twoHand: boolean): Stats {
  if (!twoHand) return stats
  return { ...stats, str: Math.min(99, Math.floor(stats.str * 1.5)) }
}

/* ---------- Attack Rating with soft caps + scaling letters ---------- */

const SCALING_MULT: Record<Grade, number> = {
  S: 1.5,
  A: 1.2,
  B: 0.9,
  C: 0.6,
  D: 0.3,
  E: 0.1,
}

// Soft caps at 20 / 50 / 80: the marginal return of each attribute point
// tapers off after each breakpoint (a simplified calc-correct curve).
// Returns a 0..1 saturation factor for a given attribute value.
export function softCapSaturation(value: number): number {
  const v = Math.max(0, Math.min(99, value))
  const points: [number, number][] = [
    [1, 0],
    [20, 0.6], // first soft cap
    [50, 0.85], // second soft cap
    [80, 0.95], // third soft cap
    [99, 1.0],
  ]
  if (v <= points[0][0]) return 0
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[i + 1]
    if (v <= x1) {
      const ratio = (v - x0) / (x1 - x0)
      return y0 + ratio * (y1 - y0)
    }
  }
  return 1.0
}

export type ARBreakdown = {
  base: number
  scalingBonus: number
  total: number
  contributions: { stat: StatKey; grade: Grade; amount: number }[]
}

// AR = base damage + Σ ( base · letterMultiplier · softCapSaturation(stat) )
export function attackRatingBreakdown(
  weapon: Weapon,
  stats: Stats,
  opts: { twoHand?: boolean; affinity?: Affinity } = {},
): ARBreakdown {
  const affinity = opts.affinity ?? 'Standard'
  const eff = effectiveStats(stats, opts.twoHand ?? false)
  const base = weapon.baseAttack * AFFINITY_PROFILE[affinity].baseMult
  const scaling = effectiveScaling(weapon, affinity)

  const contributions = scaling.map((s) => {
    const mult = SCALING_MULT[s.grade]
    const amount = base * mult * softCapSaturation(eff[s.stat])
    return { stat: s.stat, grade: s.grade, amount: Math.round(amount) }
  })

  const scalingBonus = contributions.reduce((sum, c) => sum + c.amount, 0)
  return {
    base: Math.round(base),
    scalingBonus,
    total: Math.round(base) + scalingBonus,
    contributions,
  }
}

export function attackRating(
  weapon: Weapon,
  stats: Stats,
  opts: { twoHand?: boolean; affinity?: Affinity } = {},
): number {
  return attackRatingBreakdown(weapon, stats, opts).total
}

/* ---------- Requirements (respect two-handing str bonus) ---------- */

export function meetsRequirements(
  weapon: Weapon,
  stats: Stats,
  opts: { twoHand?: boolean } = {},
): boolean {
  const eff = effectiveStats(stats, opts.twoHand ?? false)
  return weapon.requirements.every((r) => eff[r.stat] >= r.amount)
}

export function missingRequirements(
  weapon: Weapon,
  stats: Stats,
  opts: { twoHand?: boolean } = {},
): Requirement[] {
  const eff = effectiveStats(stats, opts.twoHand ?? false)
  return weapon.requirements.filter((r) => eff[r.stat] < r.amount)
}

/* ---------- Equip load ---------- */

// Interpolated max equip load from documented Elden Ring breakpoints.
const EQUIP_LOAD_TABLE: [number, number][] = [
  [8, 45.0],
  [15, 57.0],
  [25, 72.5],
  [30, 80.0],
  [40, 96.0],
  [50, 120.0],
  [60, 160.0],
  [99, 191.0],
]

export function baseEquipLoad(endurance: number): number {
  const t = EQUIP_LOAD_TABLE
  if (endurance <= t[0][0]) return t[0][1]
  if (endurance >= t[t.length - 1][0]) return t[t.length - 1][1]
  for (let i = 0; i < t.length - 1; i++) {
    const [x0, y0] = t[i]
    const [x1, y1] = t[i + 1]
    if (endurance >= x0 && endurance <= x1) {
      const ratio = (endurance - x0) / (x1 - x0)
      return y0 + ratio * (y1 - y0)
    }
  }
  return t[t.length - 1][1]
}

/* ---------- Equip-load talismans ---------- */

export type TalismanId = 'greatJar' | 'erdtreeFavor2'

export const TALISMANS: {
  id: TalismanId
  name: string
  bonus: number
  blurb: string
}[] = [
  {
    id: 'greatJar',
    name: "Great-Jar's Arsenal",
    bonus: 0.19,
    blurb: '+19% maximum equip load',
  },
  {
    id: 'erdtreeFavor2',
    name: "Erdtree's Favor +2",
    bonus: 0.08,
    blurb: '+8% maximum equip load',
  },
]

export function maxEquipLoad(
  endurance: number,
  talismans: Record<TalismanId, boolean> = { greatJar: false, erdtreeFavor2: false },
): number {
  const base = baseEquipLoad(endurance)
  const bonus = TALISMANS.reduce(
    (sum, t) => (talismans[t.id] ? sum + t.bonus : sum),
    0,
  )
  return base * (1 + bonus)
}

export type RollType = 'Light' | 'Medium' | 'Heavy' | 'Overloaded'

export function rollStatus(pct: number): RollType {
  if (pct > 100) return 'Overloaded'
  if (pct >= 70) return 'Heavy'
  if (pct >= 30) return 'Medium'
  return 'Light'
}

/* ---------- Armor optimizer (constraint solver) ---------- */

export type ArmorSelection = Record<ArmorSlot, Armor | null>

export const EMPTY_ARMOR: ArmorSelection = {
  head: null,
  chest: null,
  hands: null,
  legs: null,
}

export type OptimizeResult = {
  selection: ArmorSelection
  totalPhysNeg: number
  totalWeight: number
  budget: number
  feasible: boolean
}

/**
 * Finds the armor set (one piece or nothing per slot) that maximizes total
 * physical damage negation while keeping total equipment weight STRICTLY
 * under 70% of max equip load (Medium / normal roll).
 *
 * `reservedWeight` is weight already committed (e.g. the equipped weapon),
 * which also counts against the equip load.
 *
 * With four slots and a handful of options each, an exhaustive search is
 * both exact and instant.
 */
export function optimizeArmor(
  maxLoad: number,
  reservedWeight = 0,
): OptimizeResult {
  const budget = maxLoad * 0.7
  const armorBudget = budget - reservedWeight

  const optionsBySlot: Armor[][] = ARMOR_SLOTS.map((s) =>
    ARMORS.filter((a) => a.slot === s.key),
  )

  let best: OptimizeResult = {
    selection: { ...EMPTY_ARMOR },
    totalPhysNeg: 0,
    totalWeight: 0,
    budget,
    feasible: armorBudget >= 0,
  }

  const slotKeys = ARMOR_SLOTS.map((s) => s.key)

  const search = (
    index: number,
    current: ArmorSelection,
    weight: number,
    physNeg: number,
  ) => {
    if (weight >= armorBudget) return // strictly under budget
    if (index === slotKeys.length) {
      if (physNeg > best.totalPhysNeg) {
        best = {
          selection: { ...current },
          totalPhysNeg: Math.round(physNeg * 10) / 10,
          totalWeight: Math.round(weight * 10) / 10,
          budget,
          feasible: true,
        }
      }
      return
    }
    const slot = slotKeys[index]
    // Option: leave the slot empty.
    search(index + 1, { ...current, [slot]: null }, weight, physNeg)
    // Option: try each armor piece for this slot.
    for (const piece of optionsBySlot[index]) {
      const nextWeight = weight + piece.weight
      if (nextWeight >= armorBudget) continue
      search(
        index + 1,
        { ...current, [slot]: piece },
        nextWeight,
        physNeg + piece.physNeg,
      )
    }
  }

  search(0, { ...EMPTY_ARMOR }, 0, 0)
  return best
}

/* ---------- Lookup helpers ---------- */

export function getWeaponById(id: string | null | undefined): Weapon | null {
  if (!id) return null
  return WEAPONS.find((w) => w.id === id) ?? null
}

export function getArmorById(id: string | null | undefined): Armor | null {
  if (!id) return null
  return ARMORS.find((a) => a.id === id) ?? null
}

/* ---------- Starting-class default loadouts ---------- */

// Each class's canonical starting kit — one weapon + one armor piece per
// slot — chosen so it's usable at that class's own starting attributes
// (verified against `meetsRequirements`) and roughly weight-appropriate
// (verified to sit under the 70% Medium-roll equip-load budget).
export type StarterLoadout = {
  weapon: string
  armor: Partial<Record<ArmorSlot, string>>
}

export const STARTER_LOADOUT: Record<StartingClass, StarterLoadout> = {
  // The real Wretch starts at level 1 with a Club and no armor at all.
  Wretch: {
    weapon: 'dagger',
    armor: {},
  },
  Vagabond: {
    weapon: 'longsword',
    armor: {
      head: 'vagabond-knight-helm',
      chest: 'vagabond-knight-armor',
      hands: 'vagabond-knight-gauntlets',
      legs: 'vagabond-knight-greaves',
    },
  },
  Warrior: {
    weapon: 'longsword',
    armor: {
      head: 'blue-cloth-cowl',
      chest: 'blue-cloth-vest',
      hands: 'warrior-gauntlets',
      legs: 'warrior-greaves',
    },
  },
  Hero: {
    weapon: 'battle-axe',
    armor: {
      head: 'champion-headband',
      chest: 'champion-pauldron',
      hands: 'champion-bracers',
      legs: 'champion-gaiters',
    },
  },
  Bandit: {
    weapon: 'dagger',
    armor: {
      head: 'bandit-mask',
      chest: 'bandit-garb',
      hands: 'bandit-manchettes',
      legs: 'bandit-boots',
    },
  },
  Astrologer: {
    weapon: 'rapier',
    armor: {
      head: 'astrologer-hood',
      chest: 'astrologer-robe',
      hands: 'astrologer-gloves',
      legs: 'astrologer-trousers',
    },
  },
  // The real Prophet has no arms piece in its starting kit.
  Prophet: {
    weapon: 'longsword',
    armor: {
      head: 'prophet-blindfold',
      chest: 'prophet-robe',
      legs: 'prophet-trousers',
    },
  },
  Confessor: {
    weapon: 'longsword',
    armor: {
      head: 'confessor-hood',
      chest: 'confessor-armor',
      hands: 'confessor-gloves',
      legs: 'confessor-boots',
    },
  },
  Samurai: {
    weapon: 'uchigatana',
    armor: {
      head: 'land-of-reeds-helm',
      chest: 'land-of-reeds-armor',
      hands: 'land-of-reeds-gauntlets',
      legs: 'land-of-reeds-greaves',
    },
  },
  // The real Prisoner has no arms piece in its starting kit.
  Prisoner: {
    weapon: 'longsword',
    armor: {
      head: 'prisoner-iron-mask',
      chest: 'prisoner-clothing',
      legs: 'prisoner-trousers',
    },
  },
}

/** Resolves a class's starter loadout IDs into real Weapon/Armor objects. */
export function resolveStarterLoadout(c: StartingClass): {
  weapon: Weapon | null
  armor: ArmorSelection
} {
  const kit = STARTER_LOADOUT[c]
  const armor: ArmorSelection = { ...EMPTY_ARMOR }
  for (const slot of Object.keys(kit.armor) as ArmorSlot[]) {
    armor[slot] = getArmorById(kit.armor[slot])
  }
  return { weapon: getWeaponById(kit.weapon), armor }
}

/* ===========================================================================
 * Tabs (was components/tabs.tsx)
 * =========================================================================== */

export type TabId = string

export type TabDef = {
  id: TabId
  label: string
  icon: LucideIcon
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[]
  active: TabId
  onChange: (id: TabId) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Build sections"
      className="flex flex-wrap gap-1 rounded-lg border border-border bg-card/60 p-1.5 sm:flex-nowrap"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium tracking-wide transition-colors sm:flex-1 ${
              isActive
                ? 'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_var(--color-primary)]'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            }`}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({
  id,
  active,
  children,
}: {
  id: TabId
  active: TabId
  children: React.ReactNode
}) {
  if (id !== active) return null
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      className="flex flex-col gap-5"
    >
      {children}
    </div>
  )
}

/* ===========================================================================
 * Class panel (was components/class-panel.tsx)
 * =========================================================================== */

export function ClassPanel({
  startingClass,
  onClassChange,
}: {
  startingClass: StartingClass
  onClassChange: (c: StartingClass) => void
}) {
  return (
    <section className="rounded-lg border border-border bg-card/60 p-5">
      <header className="mb-4 flex items-baseline justify-between border-b border-border pb-3">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold tracking-wide text-primary">
          <UserRound className="size-5" aria-hidden="true" />
          Starting Class
        </h2>
      </header>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Origin
        </span>
        <select
          value={startingClass}
          onChange={(e) => onClassChange(e.target.value as StartingClass)}
          className="rounded-md border border-border bg-secondary/50 px-2.5 py-2 text-sm text-foreground outline-none focus-visible:border-primary"
        >
          {CLASS_NAMES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5 text-[11px] text-muted-foreground">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary/70" aria-hidden="true" />
        <span>
          Attributes are set to this class&apos;s minimums, and its starting
          weapon &amp; armor are auto-equipped into your loadout. Switching
          class resets your loadout to that class&apos;s starting kit.
        </span>
      </div>
    </section>
  )
}

/* ===========================================================================
 * Weapon setup panel (was components/weapon-setup-panel.tsx)
 * =========================================================================== */

export function WeaponSetupPanel({
  affinity,
  onAffinityChange,
  twoHand,
  onTwoHandChange,
}: {
  affinity: Affinity
  onAffinityChange: (a: Affinity) => void
  twoHand: boolean
  onTwoHandChange: (v: boolean) => void
}) {
  return (
    <section className="rounded-lg border border-border bg-card/60 p-5">
      <header className="mb-4 flex items-baseline justify-between border-b border-border pb-3">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold tracking-wide text-primary">
          <Settings2 className="size-5" aria-hidden="true" />
          Weapon Setup
        </h2>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Weapon Affinity
          </span>
          <select
            value={affinity}
            onChange={(e) => onAffinityChange(e.target.value as Affinity)}
            className="rounded-md border border-border bg-secondary/50 px-2.5 py-2 text-sm text-foreground outline-none focus-visible:border-primary"
          >
            {AFFINITIES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 cursor-pointer select-none items-center gap-3 rounded-md border border-border/60 bg-secondary/40 px-3 py-2.5">
          <input
            type="checkbox"
            checked={twoHand}
            onChange={(e) => onTwoHandChange(e.target.checked)}
            className="size-4 accent-primary"
          />
          <Hand className="size-4 text-primary" aria-hidden="true" />
          <span className="flex-1 text-sm text-foreground">Two-Handing</span>
          <span className="font-mono text-[11px] text-muted-foreground">
            Str ×1.5
          </span>
        </label>
      </div>
    </section>
  )
}

/* ===========================================================================
 * Talisman panel (was components/talisman-panel.tsx)
 * =========================================================================== */

export function TalismanPanel({
  talismans,
  onToggle,
}: {
  talismans: Record<TalismanId, boolean>
  onToggle: (id: TalismanId) => void
}) {
  return (
    <section className="rounded-lg border border-border bg-card/60 p-5">
      <header className="mb-4 flex items-baseline justify-between border-b border-border pb-3">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold tracking-wide text-primary">
          <Gem className="size-5" aria-hidden="true" />
          Equip Load Talismans
        </h2>
      </header>

      <div className="flex flex-col gap-2">
        {TALISMANS.map((t) => (
          <label
            key={t.id}
            className="flex cursor-pointer select-none items-center gap-3 rounded-md border border-border/60 bg-secondary/40 px-3 py-2"
          >
            <input
              type="checkbox"
              checked={talismans[t.id]}
              onChange={() => onToggle(t.id)}
              className="size-4 accent-primary"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-foreground">{t.name}</div>
              <div className="text-[11px] text-muted-foreground">{t.blurb}</div>
            </div>
          </label>
        ))}
      </div>
    </section>
  )
}

/* ===========================================================================
 * Spell placeholder (was components/spell-placeholder.tsx)
 * =========================================================================== */

export function SpellPlaceholder() {
  return (
    <section className="rounded-lg border border-dashed border-border bg-card/40 p-5">
      <header className="mb-2 flex items-center gap-2">
        <Wand2 className="size-5 text-muted-foreground" aria-hidden="true" />
        <h2 className="font-serif text-lg font-semibold tracking-wide text-muted-foreground">
          Sorceries &amp; Incantations
        </h2>
      </header>
      <p className="text-sm text-muted-foreground">
        Spell loadouts (memory slots, seal/staff scaling, FP cost vs. Mind)
        aren&apos;t modeled yet — planned for a future iteration. For now this
        tab covers weapon &amp; affinity setup.
      </p>
    </section>
  )
}

/* ===========================================================================
 * Stat panel (was components/stat-panel.tsx)
 * =========================================================================== */

const MIN = 10
const MAX = 99

function StatRow({
  label,
  short,
  value,
  floor,
  onChange,
}: {
  label: string
  short: string
  value: number
  floor: number
  onChange: (v: number) => void
}) {
  const min = Math.max(MIN, floor)
  const pct = ((value - min) / (MAX - min)) * 100

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1">
      <label
        htmlFor={`stat-${short}`}
        className="font-serif text-sm tracking-wide text-foreground/90"
      >
        {label}
        {floor > MIN && (
          <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
            min {floor}
          </span>
        )}
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          −
        </button>
        <span className="w-8 text-center font-mono text-lg font-semibold tabular-nums text-primary">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(Math.min(MAX, value + 1))}
          className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          +
        </button>
      </div>
      <input
        id={`stat-${short}`}
        type="range"
        min={min}
        max={MAX}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${label} ${value}`}
        className="er-slider col-span-2"
        style={{ ['--fill' as string]: `${pct}%` }}
      />
    </div>
  )
}

export function StatPanel({
  stats,
  floors,
  onChange,
}: {
  stats: Stats
  floors: Stats
  onChange: (key: StatKey, value: number) => void
}) {
  const total = STAT_META.reduce((sum, s) => sum + stats[s.key], 0)

  return (
    <section className="rounded-lg border border-border bg-card/60 p-5">
      <header className="mb-5 flex items-baseline justify-between border-b border-border pb-3">
        <h2 className="font-serif text-lg font-semibold tracking-wide text-primary">
          Attributes
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          Total <span className="text-foreground">{total}</span>
        </span>
      </header>
      <div className="flex flex-col gap-5">
        {STAT_META.map((s) => (
          <StatRow
            key={s.key}
            label={s.label}
            short={s.short}
            value={stats[s.key]}
            floor={floors[s.key]}
            onChange={(v) => onChange(s.key, v)}
          />
        ))}
      </div>
    </section>
  )
}

/* ===========================================================================
 * Equip load panel (was components/equip-load-panel.tsx)
 * =========================================================================== */

const ROLL_INFO: Record<
  RollType,
  { icon: typeof Feather; blurb: string; className: string; bar: string }
> = {
  Light: {
    icon: Feather,
    blurb: 'Fast roll — quick, long-distance evade.',
    className: 'text-success border-success/40 bg-success/10',
    bar: 'bg-success',
  },
  Medium: {
    icon: Footprints,
    blurb: 'Normal roll — balanced evade distance.',
    className: 'text-primary border-primary/40 bg-primary/10',
    bar: 'bg-primary',
  },
  Heavy: {
    icon: Weight,
    blurb: 'Fat roll — slow, short-distance evade.',
    className: 'text-warning border-warning/40 bg-warning/10',
    bar: 'bg-warning',
  },
  Overloaded: {
    icon: AlertTriangle,
    blurb: 'Overloaded — you cannot roll or backstep.',
    className: 'text-destructive border-destructive/40 bg-destructive/10',
    bar: 'bg-destructive',
  },
}

export function EquipLoadPanel({
  endurance,
  maxLoad,
  currentWeight,
}: {
  endurance: number
  maxLoad: number
  currentWeight: number
}) {
  const pct = maxLoad > 0 ? (currentWeight / maxLoad) * 100 : 0
  const status = rollStatus(pct)
  const info = ROLL_INFO[status]
  const Icon = info.icon

  return (
    <section className="rounded-lg border border-border bg-card/60 p-5">
      <header className="mb-4 flex items-baseline justify-between border-b border-border pb-3">
        <h2 className="font-serif text-lg font-semibold tracking-wide text-primary">
          Equip Load
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          End <span className="text-foreground">{endurance}</span>
        </span>
      </header>

      <div className="mb-3 flex items-end justify-between">
        <div className="font-mono text-2xl font-semibold tabular-nums">
          <span className="text-foreground">{currentWeight.toFixed(1)}</span>
          <span className="text-muted-foreground"> / {maxLoad.toFixed(1)}</span>
        </div>
        <div className="font-mono text-sm tabular-nums text-muted-foreground">
          {pct.toFixed(0)}%
        </div>
      </div>

      {/* Load bar with roll-threshold markers */}
      <div className="relative mb-4 h-3 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-200 ${info.bar}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
        {[30, 70].map((mark) => (
          <span
            key={mark}
            className="absolute top-0 h-full w-px bg-background/70"
            style={{ left: `${mark}%` }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div
        className={`flex items-center gap-3 rounded-md border px-3 py-2.5 ${info.className}`}
      >
        <Icon className="size-5 shrink-0" aria-hidden="true" />
        <div>
          <div className="font-serif text-sm font-semibold">{status}</div>
          <div className="text-xs opacity-90">{info.blurb}</div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Light', hint: '< 30%' },
          { label: 'Medium', hint: '30–70%' },
          { label: 'Heavy', hint: '70–100%' },
        ].map((t) => (
          <div
            key={t.label}
            className="rounded border border-border/60 px-1 py-1.5"
          >
            <dt className="text-[11px] font-medium text-foreground/80">
              {t.label}
            </dt>
            <dd className="font-mono text-[10px] text-muted-foreground">
              {t.hint}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* ===========================================================================
 * Armor selector (was components/armor-selector.tsx)
 * =========================================================================== */

export function ArmorSelector({
  selection,
  maxLoad,
  reservedWeight,
  onSelect,
  onSelectAll,
}: {
  selection: ArmorSelection
  maxLoad: number
  reservedWeight: number
  onSelect: (slot: ArmorSlot, armor: Armor | null) => void
  onSelectAll: (selection: ArmorSelection) => void
}) {
  const [openSlot, setOpenSlot] = useState<ArmorSlot | null>(null)
  const [query, setQuery] = useState('')
  const [note, setNote] = useState<string | null>(null)

  const options = useMemo(() => {
    if (!openSlot) return []
    const q = query.trim().toLowerCase()
    return ARMORS.filter(
      (a) => a.slot === openSlot && (q === '' || a.name.toLowerCase().includes(q)),
    ).sort((a, b) => b.physNeg - a.physNeg)
  }, [openSlot, query])

  const armorWeight = ARMOR_SLOTS.reduce(
    (sum, s) => sum + (selection[s.key]?.weight ?? 0),
    0,
  )
  const totalPhysNeg = ARMOR_SLOTS.reduce(
    (sum, s) => sum + (selection[s.key]?.physNeg ?? 0),
    0,
  )

  const handleOptimize = () => {
    const result = optimizeArmor(maxLoad, reservedWeight)
    onSelectAll(result.selection)
    if (!result.feasible || result.totalPhysNeg === 0) {
      setNote(
        'No armor fits under the Medium-roll budget — raise Endurance, drop the weapon, or add a talisman.',
      )
    } else {
      setNote(
        `Best set: ${result.totalPhysNeg.toFixed(1)} phys negation at ${result.totalWeight.toFixed(1)} wt (budget ${result.budget.toFixed(1)}).`,
      )
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card/60 p-5">
      <header className="mb-4 flex items-baseline justify-between border-b border-border pb-3">
        <h2 className="font-serif text-lg font-semibold tracking-wide text-primary">
          Armor
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          <span className="text-foreground">{armorWeight.toFixed(1)}</span> wt ·{' '}
          <span className="text-primary">{totalPhysNeg.toFixed(1)}</span> phys
        </span>
      </header>

      <button
        type="button"
        onClick={handleOptimize}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-md border border-primary/50 bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
      >
        <Sparkles className="size-4" aria-hidden="true" />
        Optimize Armor (Medium Roll)
      </button>

      {note && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-border/60 bg-secondary/40 px-3 py-2 text-[11px] text-muted-foreground">
          <TriangleAlert
            className="mt-0.5 size-3.5 shrink-0 text-primary/70"
            aria-hidden="true"
          />
          <span>{note}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {ARMOR_SLOTS.map((slot) => {
          const equipped = selection[slot.key]
          return (
            <div
              key={slot.key}
              className="flex items-center gap-3 rounded-md border border-border/60 bg-secondary/40 p-2"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground">
                <Shield className="size-4" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {slot.label}
                </div>
                <div className="truncate text-sm text-foreground">
                  {equipped ? equipped.name : 'Empty'}
                </div>
              </div>

              {equipped && (
                <span className="shrink-0 text-right font-mono text-[11px] leading-tight text-muted-foreground">
                  <span className="block text-foreground">
                    {equipped.weight.toFixed(1)} wt
                  </span>
                  <span className="block text-primary">
                    {equipped.physNeg.toFixed(1)} phys
                  </span>
                </span>
              )}

              <div className="flex shrink-0 items-center gap-1">
                {equipped && (
                  <button
                    type="button"
                    aria-label={`Unequip ${slot.label}`}
                    onClick={() => onSelect(slot.key, null)}
                    className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setOpenSlot(slot.key)
                    setQuery('')
                  }}
                  className="rounded border border-border px-2 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary"
                >
                  {equipped ? 'Swap' : 'Equip'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {openSlot && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Choose ${openSlot} armor`}
          onClick={() => setOpenSlot(null)}
        >
          <div
            className="flex max-h-[80vh] w-full flex-col rounded-t-xl border border-border bg-card sm:max-w-md sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-serif text-base font-semibold text-primary">
                {ARMOR_SLOTS.find((s) => s.key === openSlot)?.label}
              </h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpenSlot(null)}
                className="flex size-8 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="border-b border-border p-3">
              <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2">
                <Search className="size-4 text-muted-foreground" aria-hidden="true" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search armor..."
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto p-2">
              {options.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(openSlot, a)
                      setOpenSlot(null)
                    }}
                    className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-secondary"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded border border-border/60 bg-secondary/60 text-primary/70">
                      <Shield className="size-4" aria-hidden="true" />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {a.name}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {a.weight.toFixed(1)} wt
                    </span>
                    <span className="shrink-0 font-mono text-xs text-primary">
                      {a.physNeg.toFixed(1)} phys
                    </span>
                  </button>
                </li>
              ))}
              {options.length === 0 && (
                <li className="p-6 text-center text-sm text-muted-foreground">
                  No matching armor.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}

/* ===========================================================================
 * Weapon matrix (was components/weapon-matrix.tsx)
 * =========================================================================== */

const GRADE_COLOR: Record<string, string> = {
  S: 'text-accent',
  A: 'text-primary',
  B: 'text-success',
  C: 'text-foreground',
  D: 'text-muted-foreground',
  E: 'text-muted-foreground',
}

function shortOf(stat: StatKey) {
  return STAT_META.find((s) => s.key === stat)?.short ?? stat
}

function WeaponRow({
  weapon,
  stats,
  twoHand,
  affinity,
  onEquip,
  equipped,
}: {
  weapon: Weapon
  stats: Stats
  twoHand: boolean
  affinity: Affinity
  onEquip: (w: Weapon) => void
  equipped: boolean
}) {
  const usable = meetsRequirements(weapon, stats, { twoHand })
  const missing = usable ? [] : missingRequirements(weapon, stats, { twoHand })
  const ar = attackRating(weapon, stats, { twoHand, affinity })
  const scaling = effectiveScaling(weapon, affinity)

  return (
    <tr
      className={`border-b border-border/50 transition-colors ${
        usable ? 'hover:bg-secondary/40' : 'opacity-55'
      } ${equipped ? 'bg-primary/10' : ''}`}
    >
      <td className="py-2 pl-3 pr-2">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded border border-border/60 bg-secondary/60 text-primary/70">
            <Swords className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">
              {weapon.name}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {weapon.category} · {weapon.weight.toFixed(1)} wt
            </div>
          </div>
        </div>
      </td>

      <td className="px-2 text-center">
        {usable ? (
          <span className="font-mono text-base font-semibold tabular-nums text-primary">
            {ar}
          </span>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">—</span>
        )}
      </td>

      <td className="hidden px-2 sm:table-cell">
        <div className="flex flex-wrap justify-center gap-1">
          {scaling.length === 0 ? (
            <span className="text-xs text-muted-foreground">none</span>
          ) : (
            scaling.map((s) => (
              <span
                key={s.stat}
                className="font-mono text-xs"
                title={`${shortOf(s.stat)} scaling`}
              >
                <span className="text-muted-foreground">{shortOf(s.stat)}</span>{' '}
                <span className={`font-bold ${GRADE_COLOR[s.grade] ?? ''}`}>
                  {s.grade}
                </span>
              </span>
            ))
          )}
        </div>
      </td>

      <td className="px-2">
        <div className="flex flex-wrap justify-center gap-1">
          {weapon.requirements.length === 0 ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : (
            weapon.requirements.map((r) => {
              const met = stats[r.stat] >= r.amount
              return (
                <span
                  key={r.stat}
                  className={`rounded px-1 font-mono text-[11px] ${
                    met
                      ? 'text-foreground/70'
                      : 'bg-destructive/15 text-destructive'
                  }`}
                >
                  {shortOf(r.stat)} {r.amount}
                </span>
              )
            })
          )}
        </div>
      </td>

      <td className="py-2 pl-2 pr-3 text-right">
        {usable ? (
          <button
            type="button"
            onClick={() => onEquip(weapon)}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition-colors ${
              equipped
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-foreground/80 hover:border-primary hover:text-primary'
            }`}
          >
            {equipped ? (
              <>
                <Check className="size-3" aria-hidden="true" /> Equipped
              </>
            ) : (
              'Equip'
            )}
          </button>
        ) : (
          <span
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
            title={`Needs ${missing
              .map((m) => `${shortOf(m.stat)} ${m.amount}`)
              .join(', ')}`}
          >
            <Lock className="size-3" aria-hidden="true" /> Locked
          </span>
        )}
      </td>
    </tr>
  )
}

export function WeaponMatrix({
  stats,
  twoHand,
  affinity,
  equippedWeaponId,
  onEquip,
}: {
  stats: Stats
  twoHand: boolean
  affinity: Affinity
  equippedWeaponId: string | null
  onEquip: (w: Weapon) => void
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('All')
  const [onlyUsable, setOnlyUsable] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return WEAPONS.filter((w) => {
      if (category !== 'All' && w.category !== category) return false
      if (q && !w.name.toLowerCase().includes(q)) return false
      if (onlyUsable && !meetsRequirements(w, stats, { twoHand })) return false
      return true
    })
      .map((w) => ({
        w,
        usable: meetsRequirements(w, stats, { twoHand }),
        ar: attackRating(w, stats, { twoHand, affinity }),
      }))
      .sort((a, b) => {
        if (a.usable !== b.usable) return a.usable ? -1 : 1
        return b.ar - a.ar
      })
      .map((x) => x.w)
  }, [query, category, onlyUsable, stats, twoHand, affinity])

  const usableCount = useMemo(
    () => WEAPONS.filter((w) => meetsRequirements(w, stats, { twoHand })).length,
    [stats, twoHand],
  )

  return (
    <section className="rounded-lg border border-border bg-card/60">
      <header className="border-b border-border p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold tracking-wide text-primary">
            <Swords className="size-5" aria-hidden="true" />
            Weapon Matrix
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            <span className="text-foreground">{usableCount}</span> / {WEAPONS.length} usable
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2">
            <Search className="size-4 text-muted-foreground" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search weapons..."
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary"
          >
            <option value="All">All types</option>
            {WEAPON_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label className="flex cursor-pointer select-none items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={onlyUsable}
              onChange={(e) => setOnlyUsable(e.target.checked)}
              className="accent-primary"
            />
            Usable only
          </label>
        </div>
      </header>

      <div className="max-h-[540px] overflow-y-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pl-3 pr-2 text-left font-medium">Weapon</th>
              <th className="px-2 text-center font-medium">AR</th>
              <th className="hidden px-2 text-center font-medium sm:table-cell">
                Scaling
              </th>
              <th className="px-2 text-center font-medium">Requires</th>
              <th className="py-2 pl-2 pr-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <WeaponRow
                key={w.id}
                weapon={w}
                stats={stats}
                twoHand={twoHand}
                affinity={affinity}
                onEquip={onEquip}
                equipped={equippedWeaponId === w.id}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No weapons match your filters.
          </div>
        )}
      </div>

      <footer className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
        AR applies scaling-letter multipliers (S 1.5 / A 1.2 / B 0.9 / C 0.6 / D
        0.3 / E 0.1) with soft caps at 20 / 50 / 80 — a comparison guide, not the
        exact in-game value.
      </footer>
    </section>
  )
}

/* ===========================================================================
 * Build summary (was components/build-summary.tsx)
 * =========================================================================== */

function SummaryCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Swords
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card/60 p-5">
      <header className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <Icon className="size-5 text-primary" aria-hidden="true" />
        <h2 className="font-serif text-lg font-semibold tracking-wide text-primary">
          {title}
        </h2>
      </header>
      {children}
    </section>
  )
}

export function BuildSummary({
  startingClass,
  stats,
  weapon,
  arInfo,
  affinity,
  twoHand,
  armor,
  maxLoad,
  currentWeight,
  talismans,
}: {
  startingClass: StartingClass
  stats: Stats
  weapon: Weapon | null
  arInfo: ARBreakdown | null
  affinity: Affinity
  twoHand: boolean
  armor: ArmorSelection
  maxLoad: number
  currentWeight: number
  talismans: Record<TalismanId, boolean>
}) {
  const totalStats = STAT_META.reduce((sum, s) => sum + stats[s.key], 0)
  const totalPhysNeg = ARMOR_SLOTS.reduce(
    (sum, s) => sum + (armor[s.key]?.physNeg ?? 0),
    0,
  )
  const pct = maxLoad > 0 ? (currentWeight / maxLoad) * 100 : 0
  const status = rollStatus(pct)
  const activeTalismans = TALISMANS.filter((t) => talismans[t.id])

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <SummaryCard icon={UserRound} title="Character">
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Starting Class</dt>
          <dd className="text-right font-medium text-foreground">
            {startingClass}
          </dd>
          <dt className="text-muted-foreground">Total Attribute Points</dt>
          <dd className="text-right font-mono text-foreground">{totalStats}</dd>
        </dl>
        <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border/60 pt-3 sm:grid-cols-8">
          {STAT_META.map((s) => (
            <div key={s.key} className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.short}
              </div>
              <div className="font-mono text-sm font-semibold text-primary">
                {stats[s.key]}
              </div>
            </div>
          ))}
        </div>
      </SummaryCard>

      <SummaryCard icon={Swords} title="Weapon">
        {weapon && arInfo ? (
          <div>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="font-serif text-base font-semibold text-foreground">
                  {weapon.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {affinity}
                  {twoHand ? ' · Two-Handed' : ''} · {weapon.weight.toFixed(1)} wt
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Attack Rating
                </div>
                <div className="font-mono text-2xl font-semibold leading-none text-primary">
                  {arInfo.total}
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-3 font-mono text-[11px] text-muted-foreground">
              <span>
                base <span className="text-foreground">{arInfo.base}</span>
              </span>
              <span>
                scaling{' '}
                <span className="text-foreground">+{arInfo.scalingBonus}</span>
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No weapon equipped yet — pick one in Equipment &amp; Spells.
          </p>
        )}
      </SummaryCard>

      <SummaryCard icon={Shield} title="Armor">
        <div className="mb-3 flex justify-between font-mono text-xs text-muted-foreground">
          <span>
            Total <span className="text-primary">{totalPhysNeg.toFixed(1)}</span>{' '}
            phys negation
          </span>
        </div>
        <ul className="flex flex-col gap-1.5">
          {ARMOR_SLOTS.map((slot) => {
            const piece = armor[slot.key]
            return (
              <li
                key={slot.key}
                className="flex items-center justify-between rounded-md border border-border/60 bg-secondary/40 px-3 py-1.5 text-sm"
              >
                <span className="text-muted-foreground">{slot.label}</span>
                <span className="truncate text-foreground">
                  {piece ? piece.name : 'Empty'}
                </span>
              </li>
            )
          })}
        </ul>
      </SummaryCard>

      <SummaryCard icon={Weight} title="Equip Load">
        <div className="mb-2 flex items-end justify-between">
          <div className="font-mono text-2xl font-semibold tabular-nums">
            <span className="text-foreground">{currentWeight.toFixed(1)}</span>
            <span className="text-muted-foreground"> / {maxLoad.toFixed(1)}</span>
          </div>
          <div className="font-mono text-sm text-muted-foreground">
            {pct.toFixed(0)}% · {status}
          </div>
        </div>
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-200"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        {activeTalismans.length > 0 ? (
          <ul className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            {activeTalismans.map((t) => (
              <li key={t.id}>
                {t.name} — {t.blurb}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            No equip-load talismans active.
          </p>
        )}
      </SummaryCard>
    </div>
  )
}

/* ===========================================================================
 * App (was app/page.tsx)
 * =========================================================================== */

const TABS: TabDef[] = [
  { id: 'character', label: 'Character & Stats', icon: UserRound },
  { id: 'equipment', label: 'Equipment & Spells', icon: Shirt },
  { id: 'armor', label: 'Armor Optimizer', icon: Shield },
  { id: 'summary', label: 'Build Summary', icon: ClipboardList },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('character')

  const [startingClass, setStartingClass] = useState<StartingClass>(DEFAULT_CLASS)
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS)

  // Auto-equip the default class's starting weapon & armor on first load.
  const initialLoadout = useMemo(() => resolveStarterLoadout(DEFAULT_CLASS), [])
  const [armor, setArmor] = useState<ArmorSelection>(initialLoadout.armor)
  const [weapon, setWeapon] = useState<Weapon | null>(initialLoadout.weapon)

  const [twoHand, setTwoHand] = useState(false)
  const [affinity, setAffinity] = useState<Affinity>('Standard')
  const [talismans, setTalismans] = useState<Record<TalismanId, boolean>>({
    greatJar: false,
    erdtreeFavor2: false,
  })

  const floors = CLASSES[startingClass]

  const setStat = (key: StatKey, value: number) =>
    setStats((prev) => ({ ...prev, [key]: Math.max(floors[key], value) }))

  const setArmorSlot = (slot: ArmorSlot, value: Armor | null) =>
    setArmor((prev) => ({ ...prev, [slot]: value }))

  const handleClassChange = (c: StartingClass) => {
    setStartingClass(c)
    // Raise any attribute below the new class's floor up to that floor.
    const newFloors = CLASSES[c]
    setStats((prev) => {
      const next = { ...prev }
      for (const s of STAT_META) {
        next[s.key] = Math.max(newFloors[s.key], prev[s.key])
      }
      return next
    })
    // Re-equip that class's default starting weapon & armor, just like
    // rolling a new character at the Table of Lost Grace.
    const loadout = resolveStarterLoadout(c)
    setWeapon(loadout.weapon)
    setArmor(loadout.armor)
  }

  const toggleTalisman = (id: TalismanId) =>
    setTalismans((prev) => ({ ...prev, [id]: !prev[id] }))

  const maxLoad = useMemo(
    () => maxEquipLoad(stats.end, talismans),
    [stats.end, talismans],
  )

  const currentWeight = useMemo(() => {
    const armorWeight = ARMOR_SLOTS.reduce(
      (sum, s) => sum + (armor[s.key]?.weight ?? 0),
      0,
    )
    return armorWeight + (weapon?.weight ?? 0)
  }, [armor, weapon])

  const arInfo = useMemo(
    () =>
      weapon
        ? attackRatingBreakdown(weapon, stats, { twoHand, affinity })
        : null,
    [weapon, stats, twoHand, affinity],
  )

  return (
    <main className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-5 sm:px-6">
          <div className="flex size-10 items-center justify-center rounded border border-primary/40 bg-primary/10 text-primary">
            <Swords className="size-5" aria-hidden="true" />
          </div>
          <EldenRingOptimizer armorData={armorData} weaponData={weaponData}/>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-wide text-primary sm:text-2xl">
              Tarnished Forge
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Elden Ring build, damage &amp; equip-load optimizer
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6">
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        <TabPanel id="character" active={activeTab}>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
            <div className="flex flex-col gap-5">
              <ClassPanel startingClass={startingClass} onClassChange={handleClassChange} />
              <TalismanPanel talismans={talismans} onToggle={toggleTalisman} />
            </div>
            <div className="flex flex-col gap-5">
              <StatPanel stats={stats} floors={floors} onChange={setStat} />
              <EquipLoadPanel
                endurance={stats.end}
                maxLoad={maxLoad}
                currentWeight={currentWeight}
              />
            </div>
          </div>
        </TabPanel>

        <TabPanel id="equipment" active={activeTab}>
          <WeaponSetupPanel
            affinity={affinity}
            onAffinityChange={setAffinity}
            twoHand={twoHand}
            onTwoHandChange={setTwoHand}
          />

          {weapon && arInfo && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded border border-primary/40 bg-primary/10 text-primary">
                  <Swords className="size-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Equipped · {affinity}
                    {twoHand ? ' · Two-Handed' : ''}
                  </div>
                  <div className="truncate font-serif text-base font-semibold text-foreground">
                    {weapon.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Attack Rating
                  </div>
                  <div className="font-mono text-2xl font-semibold leading-none text-primary">
                    {arInfo.total}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-primary/20 pt-3 font-mono text-[11px] text-muted-foreground">
                <span>
                  base <span className="text-foreground">{arInfo.base}</span>
                </span>
                <span>
                  scaling{' '}
                  <span className="text-foreground">+{arInfo.scalingBonus}</span>
                </span>
                {arInfo.contributions.map((c) => (
                  <span key={c.stat}>
                    {STAT_META.find((s) => s.key === c.stat)?.short}{' '}
                    <span className="text-accent">{c.grade}</span>{' '}
                    <span className="text-foreground">+{c.amount}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <WeaponMatrix
            stats={stats}
            twoHand={twoHand}
            affinity={affinity}
            equippedWeaponId={weapon?.id ?? null}
            onEquip={(w) => setWeapon((prev) => (prev?.id === w.id ? null : w))}
          />

          <SpellPlaceholder />
        </TabPanel>

        <TabPanel id="armor" active={activeTab}>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
            <EquipLoadPanel
              endurance={stats.end}
              maxLoad={maxLoad}
              currentWeight={currentWeight}
            />
            <ArmorSelector
              selection={armor}
              maxLoad={maxLoad}
              reservedWeight={weapon?.weight ?? 0}
              onSelect={setArmorSlot}
              onSelectAll={setArmor}
            />
          </div>
        </TabPanel>

        <TabPanel id="summary" active={activeTab}>
          <BuildSummary
            startingClass={startingClass}
            stats={stats}
            weapon={weapon}
            arInfo={arInfo}
            affinity={affinity}
            twoHand={twoHand}
            armor={armor}
            maxLoad={maxLoad}
            currentWeight={currentWeight}
            talismans={talismans}
          />
        </TabPanel>
      </div>
    </main>
  )
}
