import { create } from "zustand";
import type { Locale } from "./i18n";

export type OutfitColor = "charcoal" | "navy" | "burgundy" | "cream";
export type HairStyle = "short" | "bald" | "long";

export type ZoneId = "courtyard" | "hall" | "room";
export type ActivityId = "praying" | "resting" | "gardening" | null;

export type QtTopic = "thanks" | "repent" | "intercede" | "heal";

interface AppState {
  nickname: string;
  locale: Locale;
  hasEntered: boolean;
  outfit: OutfitColor;
  hair: HairStyle;
  currentZone: ZoneId;
  activity: ActivityId;
  nearbyActivity: ActivityId;
  customizeOpen: boolean;

  qtOpen: boolean;
  qtTopic: QtTopic | null;
  qtStep: number;
  qtPauseEnabled: boolean;

  musicOn: boolean;
  visitorsOpen: boolean;

  setNickname: (name: string) => void;
  setLocale: (locale: Locale) => void;
  enter: () => void;
  enterAndOpenQt: () => void;
  setOutfit: (outfit: OutfitColor) => void;
  setHair: (hair: HairStyle) => void;
  setCurrentZone: (zone: ZoneId) => void;
  setActivity: (activity: ActivityId) => void;
  setNearbyActivity: (activity: ActivityId) => void;
  setCustomizeOpen: (open: boolean) => void;

  openQt: () => void;
  closeQt: () => void;
  pickQtTopic: (topic: QtTopic) => void;
  setQtPauseEnabled: (enabled: boolean) => void;
  qtNext: (totalSteps: number) => void;
  qtPrev: () => void;
  resetQt: () => void;

  toggleMusic: () => void;
  setVisitorsOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  nickname: "",
  locale: "ko",
  hasEntered: false,
  outfit: "charcoal",
  hair: "short",
  currentZone: "courtyard",
  activity: null,
  nearbyActivity: null,
  customizeOpen: false,

  qtOpen: false,
  qtTopic: null,
  qtStep: 0,
  qtPauseEnabled: true,

  musicOn: false,
  visitorsOpen: false,

  setNickname: (nickname) => set({ nickname }),
  setLocale: (locale) => set({ locale }),
  enter: () => set({ hasEntered: true }),
  enterAndOpenQt: () =>
    set({ hasEntered: true, qtOpen: true, activity: "praying" }),
  setOutfit: (outfit) => set({ outfit }),
  setHair: (hair) => set({ hair }),
  setCurrentZone: (currentZone) => set({ currentZone }),
  setActivity: (activity) => set({ activity }),
  setNearbyActivity: (nearbyActivity) => set({ nearbyActivity }),
  setCustomizeOpen: (customizeOpen) => set({ customizeOpen }),

  openQt: () => set({ qtOpen: true, activity: "praying" }),
  closeQt: () =>
    set({ qtOpen: false, qtTopic: null, qtStep: 0, activity: null }),
  pickQtTopic: (topic) => set({ qtTopic: topic, qtStep: 0 }),
  setQtPauseEnabled: (qtPauseEnabled) => set({ qtPauseEnabled }),
  qtNext: (totalSteps) =>
    set({ qtStep: Math.min(get().qtStep + 1, totalSteps) }),
  qtPrev: () => set({ qtStep: Math.max(get().qtStep - 1, 0) }),
  resetQt: () => set({ qtTopic: null, qtStep: 0 }),

  toggleMusic: () => set({ musicOn: !get().musicOn }),
  setVisitorsOpen: (visitorsOpen) => set({ visitorsOpen }),
}));
