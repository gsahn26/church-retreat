import { create } from "zustand";
import type { Locale } from "./i18n";

export type OutfitColor = "charcoal" | "navy" | "burgundy" | "cream";
export type HairStyle = "short" | "bald" | "long";

export type ZoneId = "courtyard" | "hall" | "room" | "home";
export type ActivityId = "praying" | "resting" | "gardening" | "sitting" | null;

export type QtTopic = "thanks" | "repent" | "intercede" | "heal";
export type QtMode = "topic" | "timer";

// Who is in the world right now. Filled from the Realtime presence roster
// (see lib/multiplayer.js); it is not persisted anywhere.
export interface OnlineVisitor {
  sessionId: string;
  nickname: string;
}

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
  qtMode: QtMode | null;
  qtTopic: QtTopic | null;
  qtStep: number;
  qtPauseEnabled: boolean;
  qtTimerMinutes: number;
  qtTimerRunning: boolean;
  qtTimerDone: boolean;

  musicOn: boolean;
  visitorsOpen: boolean;
  liveWorshipOpen: boolean;
  onlineVisitors: OnlineVisitor[];

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
  pickQtMode: (mode: QtMode) => void;
  pickQtTopic: (topic: QtTopic) => void;
  setQtPauseEnabled: (enabled: boolean) => void;
  qtNext: (totalSteps: number) => void;
  qtPrev: () => void;
  resetQt: () => void;
  setQtTimerMinutes: (minutes: number) => void;
  startQtTimer: () => void;
  finishQtTimer: () => void;
  stopQtTimer: () => void;

  toggleMusic: () => void;
  setVisitorsOpen: (open: boolean) => void;
  setLiveWorshipOpen: (open: boolean) => void;
  setOnlineVisitors: (visitors: OnlineVisitor[]) => void;
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
  qtMode: null,
  qtTopic: null,
  qtStep: 0,
  qtPauseEnabled: true,
  qtTimerMinutes: 5,
  qtTimerRunning: false,
  qtTimerDone: false,

  musicOn: false,
  visitorsOpen: false,
  liveWorshipOpen: false,
  onlineVisitors: [],

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

  // Opening prayer while already sitting (e.g. in a pew) keeps the sitting
  // pose instead of switching to the standing "praying" one - closing it
  // goes back to whichever pose that was.
  openQt: () =>
    set((s) => ({
      qtOpen: true,
      activity: s.activity === "sitting" ? "sitting" : "praying",
    })),
  closeQt: () =>
    set((s) => ({
      qtOpen: false,
      qtMode: null,
      qtTopic: null,
      qtStep: 0,
      qtTimerRunning: false,
      qtTimerDone: false,
      activity: s.activity === "sitting" ? "sitting" : null,
    })),
  pickQtMode: (qtMode) => set({ qtMode }),
  pickQtTopic: (topic) => set({ qtTopic: topic, qtStep: 0 }),
  setQtPauseEnabled: (qtPauseEnabled) => set({ qtPauseEnabled }),
  qtNext: (totalSteps) =>
    set({ qtStep: Math.min(get().qtStep + 1, totalSteps) }),
  qtPrev: () => set({ qtStep: Math.max(get().qtStep - 1, 0) }),
  resetQt: () =>
    set({ qtMode: null, qtTopic: null, qtStep: 0, qtTimerRunning: false, qtTimerDone: false }),
  setQtTimerMinutes: (qtTimerMinutes) => set({ qtTimerMinutes }),
  startQtTimer: () => set({ qtTimerRunning: true, qtTimerDone: false }),
  finishQtTimer: () => set({ qtTimerRunning: false, qtTimerDone: true }),
  stopQtTimer: () => set({ qtTimerRunning: false, qtTimerDone: true }),

  toggleMusic: () => set({ musicOn: !get().musicOn }),
  setVisitorsOpen: (visitorsOpen) => set({ visitorsOpen }),
  setLiveWorshipOpen: (liveWorshipOpen) => set({ liveWorshipOpen }),
  setOnlineVisitors: (onlineVisitors) => set({ onlineVisitors }),
}));
