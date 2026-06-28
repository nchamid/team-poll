/**
 * Seed data for the static GitHub Pages demo (VITE_DEMO_MODE). All content is
 * synthetic — no real firm data, no PII. The mock API client (mockApiClient.ts)
 * holds a mutable copy of this so a page reload always resets to a clean state.
 *
 * This file is compiled into the app ONLY for the demo build; the production
 * (Azure + Entra) bundle never imports it.
 */

/** A poll's option as held in the demo store (counts are always present here;
 * the API client decides per-request whether to expose them to the caller). */
export interface DemoOption {
  id: number;
  text: string;
  displayOrder: number;
  voteCount: number;
}

/** A poll as held in the demo store. `isOwner` marks the polls the demo
 * visitor "owns" (and may therefore close/delete); `myVote` is the visitor's
 * recorded choice, which gates whether results are visible to them. */
export interface DemoPoll {
  id: number;
  question: string;
  isClosed: boolean;
  ownerDisplayName: string;
  isOwner: boolean;
  options: DemoOption[];
  myVote: number | null;
  isDeleted: boolean;
}

/** How the demo visitor's own polls are labelled. "You" matches the TopBar
 * avatar fallback and the detail page's "Created by you" copy, so the visitor's
 * self-reference reads consistently without injecting a synthetic MSAL account. */
export const DEMO_USER_DISPLAY_NAME = 'You';

/** Returns a fresh, mutable seed set. Called once when the demo store is
 * created; reloading the page re-runs it, resetting all demo state. */
export function buildSeedPolls(): DemoPoll[] {
  return [
    {
      id: 1,
      question: 'Which day works best for the Q3 team offsite?',
      isClosed: false,
      ownerDisplayName: DEMO_USER_DISPLAY_NAME,
      isOwner: true,
      myVote: 11,
      isDeleted: false,
      options: [
        { id: 10, text: 'Monday', displayOrder: 0, voteCount: 4 },
        { id: 11, text: 'Tuesday', displayOrder: 1, voteCount: 9 },
        { id: 12, text: 'Wednesday', displayOrder: 2, voteCount: 3 },
        { id: 13, text: 'Thursday', displayOrder: 3, voteCount: 2 },
      ],
    },
    {
      id: 2,
      question: 'Where should we grab lunch on Friday?',
      isClosed: false,
      ownerDisplayName: 'Devin Osei',
      isOwner: false,
      myVote: null,
      isDeleted: false,
      options: [
        { id: 20, text: 'Tacos', displayOrder: 0, voteCount: 5 },
        { id: 21, text: 'Sandwiches', displayOrder: 1, voteCount: 3 },
        { id: 22, text: 'Salad', displayOrder: 2, voteCount: 2 },
        { id: 23, text: 'Ramen', displayOrder: 3, voteCount: 6 },
      ],
    },
    {
      id: 3,
      question: 'Best time for the daily standup?',
      isClosed: false,
      ownerDisplayName: 'Mara Lindqvist',
      isOwner: false,
      myVote: 31,
      isDeleted: false,
      options: [
        { id: 30, text: '9:00 AM', displayOrder: 0, voteCount: 2 },
        { id: 31, text: '9:30 AM', displayOrder: 1, voteCount: 8 },
        { id: 32, text: '10:00 AM', displayOrder: 2, voteCount: 5 },
      ],
    },
    {
      id: 4,
      question: 'Which feature should we demo first to leadership?',
      isClosed: true,
      ownerDisplayName: 'Priya Nair',
      isOwner: false,
      myVote: 42,
      isDeleted: false,
      options: [
        { id: 40, text: 'Polls dashboard', displayOrder: 0, voteCount: 7 },
        { id: 41, text: 'Notifications', displayOrder: 1, voteCount: 12 },
        { id: 42, text: 'Search', displayOrder: 2, voteCount: 9 },
      ],
    },
    {
      id: 5,
      question: 'Which plant for the new lounge?',
      isClosed: true,
      ownerDisplayName: DEMO_USER_DISPLAY_NAME,
      isOwner: true,
      myVote: 51,
      isDeleted: false,
      options: [
        { id: 50, text: 'Monstera', displayOrder: 0, voteCount: 6 },
        { id: 51, text: 'Snake plant', displayOrder: 1, voteCount: 11 },
        { id: 52, text: 'Pothos', displayOrder: 2, voteCount: 4 },
      ],
    },
  ];
}
