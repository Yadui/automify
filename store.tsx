import { create } from "zustand";

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  /** fixed option that can't be removed. */
  fixed?: boolean;
  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined;
}

export interface GoogleFile {
  id: string;
  name: string;
  mimeType: string;
}

type FuzzieStore = {
  // Google Drive State
  googleFile: GoogleFile | null;
  setGoogleFile: (googleFile: GoogleFile | null) => void;

  // Slack State
  slackChannels: Option[];
  setSlackChannels: (slackChannels: Option[]) => void;
  selectedSlackChannels: Option[];
  setSelectedSlackChannels: (selectedSlackChannels: Option[]) => void;

  // Notion State
  notionDatabases: Option[];
  setNotionDatabases: (databases: Option[]) => void;
  selectedNotionDatabase: Option | null;
  setSelectedNotionDatabase: (database: Option | null) => void;

  // Discord State
  discordChannels: Option[];
  setDiscordChannels: (channels: Option[]) => void;
  selectedDiscordChannel: Option | null;
  setSelectedDiscordChannel: (channel: Option | null) => void;
};

export const useFuzzieStore = create<FuzzieStore>()((set) => ({
  // Google Drive
  googleFile: null,
  setGoogleFile: (googleFile) => set({ googleFile }),

  // Slack
  slackChannels: [],
  setSlackChannels: (slackChannels) => set({ slackChannels }),
  selectedSlackChannels: [],
  setSelectedSlackChannels: (selectedSlackChannels) =>
    set({ selectedSlackChannels }),

  // Notion
  notionDatabases: [],
  setNotionDatabases: (databases) => set({ notionDatabases: databases }),
  selectedNotionDatabase: null,
  setSelectedNotionDatabase: (database) =>
    set({ selectedNotionDatabase: database }),

  // Discord
  discordChannels: [],
  setDiscordChannels: (channels) => set({ discordChannels: channels }),
  selectedDiscordChannel: null,
  setSelectedDiscordChannel: (channel) =>
    set({ selectedDiscordChannel: channel }),
}));
