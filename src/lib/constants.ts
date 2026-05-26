export const PRIVILEGE_DURATION_DAYS = 5;
export const KIT_COOLDOWN_HOURS = 12;

export const KIT_NAMES = [
  "WEAPONS",
  "CONSTRUCTION",
  "TOOLS",
  "RESOURCES",
  "EXPLOSIVES",
] as const;

export type KitName = (typeof KIT_NAMES)[number];

export interface KitDefinition {
  name: KitName;
  label: string;
  description: string;
  items: string[];
}

export const KITS: Record<KitName, KitDefinition> = {
  WEAPONS: {
    name: "WEAPONS",
    label: "Weapons",
    description: "Combat loadout for raids, counters, and monument control.",
    items: [
      "AK-47",
      "LR-300",
      "M249",
      "5.56 Ammo x500",
      "Metal Facemask",
      "Metal Chestplate",
      "Syringes x10",
    ],
  },
  CONSTRUCTION: {
    name: "CONSTRUCTION",
    label: "Construction",
    description: "High-value building parts for stronger bases and fast repairs.",
    items: [
      "Sheet Metal Door x4",
      "Armored Door x2",
      "High External Stone Wall x10",
      "Garage Door x2",
      "Window Bars x6",
    ],
  },
  TOOLS: {
    name: "TOOLS",
    label: "Tools",
    description: "Gathering and utility tools for efficient progression.",
    items: [
      "Jackhammer",
      "Chainsaw",
      "Low Grade Fuel x500",
      "Targeting Computer x2",
    ],
  },
  RESOURCES: {
    name: "RESOURCES",
    label: "Resources",
    description: "Bulk materials for builds, upkeep, crafting, and raids.",
    items: [
      "Metal Fragments x10,000",
      "High Quality Metal x500",
      "Stone x10,000",
      "Wood x10,000",
      "Sulfur x5,000",
    ],
  },
  EXPLOSIVES: {
    name: "EXPLOSIVES",
    label: "Explosives",
    description: "Raid supplies for a short and noisy evening.",
    items: [
      "Satchel Charge x8",
      "Timed Explosive Charge x4",
      "Rockets x4",
      "Gunpowder x3,000",
    ],
  },
};

export const PRIVILEGE_TIERS = [
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
] as const;

export type PrivilegeTier = (typeof PRIVILEGE_TIERS)[number];

export interface PrivilegeDefinition {
  tier: PrivilegeTier;
  label: string;
  price: number;
  usdPrice: number;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  tagline: string;
  description: string;
  features: string[];
  kitNames: KitName[];
}

export const PRIVILEGES: PrivilegeDefinition[] = [
  {
    tier: "BRONZE",
    label: "Bronze",
    price: 10,
    usdPrice: 1,
    accentClass: "tier-bronze",
    borderClass: "tier-border-bronze",
    bgClass: "tier-bg-bronze",
    tagline: "Стартовый набор",
    description: "Базовый VIP для спокойного старта после вайпа.",
    features: ["Kit Bronze", "/home 1", "TPR раз в 24 часа", "Бронза в чате"],
    kitNames: ["WEAPONS", "CONSTRUCTION", "TOOLS", "RESOURCES", "EXPLOSIVES"],
  },
  {
    tier: "SILVER",
    label: "Silver",
    price: 20,
    usdPrice: 2,
    accentClass: "tier-silver",
    borderClass: "tier-border-silver",
    bgClass: "tier-bg-silver",
    tagline: "Уверенный прогресс",
    description: "Больше удобства для фарма, базы и быстрых возвратов.",
    features: ["Kit Silver", "/home 2", "TPR раз в 12 часов", "Серебро в чате"],
    kitNames: ["WEAPONS", "CONSTRUCTION", "TOOLS", "RESOURCES", "EXPLOSIVES"],
  },
  {
    tier: "GOLD",
    label: "Gold",
    price: 30,
    usdPrice: 3,
    accentClass: "tier-gold",
    borderClass: "tier-border-gold",
    bgClass: "tier-bg-gold",
    tagline: "Хит сезона",
    description: "Оптимальный уровень для активных игроков и небольших команд.",
    features: ["Kit Gold", "/home 3", "TPR раз в 6 часов", "Золото в чате"],
    kitNames: ["WEAPONS", "CONSTRUCTION", "TOOLS", "RESOURCES", "EXPLOSIVES"],
  },
  {
    tier: "PLATINUM",
    label: "Platinum",
    price: 40,
    usdPrice: 4,
    accentClass: "tier-platinum",
    borderClass: "tier-border-platinum",
    bgClass: "tier-bg-platinum",
    tagline: "Темп клана",
    description: "Максимум комфорта для тех, кто играет каждый день.",
    features: ["Kit Platinum", "/home 5", "TPR раз в 3 часа", "Платина в чате"],
    kitNames: ["WEAPONS", "CONSTRUCTION", "TOOLS", "RESOURCES", "EXPLOSIVES"],
  },
  {
    tier: "DIAMOND",
    label: "Diamond",
    price: 50,
    usdPrice: 5,
    accentClass: "tier-diamond",
    borderClass: "tier-border-diamond",
    bgClass: "tier-bg-diamond",
    tagline: "Премиум доступ",
    description: "Топовый статус для игроков, которые заходят громко.",
    features: ["Kit Diamond", "/home 10", "TPR без ограничений", "Алмаз в чате"],
    kitNames: ["WEAPONS", "CONSTRUCTION", "TOOLS", "RESOURCES", "EXPLOSIVES"],
  },
];

export function isPrivilegeTier(value: string): value is PrivilegeTier {
  return PRIVILEGE_TIERS.includes(value as PrivilegeTier);
}

export function isKitName(value: string): value is KitName {
  return KIT_NAMES.includes(value as KitName);
}

export function getPrivilegeDefinition(tier: string) {
  return PRIVILEGES.find((privilege) => privilege.tier === tier);
}

export function formatCredits(amount: number) {
  return `${amount.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })} SC`;
}

export function formatUsd(amount: number) {
  return `$${amount.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
}

export function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
