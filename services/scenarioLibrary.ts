import { ResearcherRole, Scenario } from "../types";

const LIBRARY_KEY = 'ethix_scenario_library_v1';
const MAX_LIBRARY_SIZE = 100; // Limit storage to 100 scenarios to prevent localStorage overflow

interface LibraryEntry {
  id: string;
  role: ResearcherRole;
  topic: string;
  scenario: Scenario;
  createdAt: number;
}

export const ScenarioLibrary = {
  /**
   * Save a generated scenario to the local library for future reuse.
   */
  add: (role: ResearcherRole, topic: string, scenario: Scenario) => {
    try {
      const stored = localStorage.getItem(LIBRARY_KEY);
      let library: LibraryEntry[] = stored ? JSON.parse(stored) : [];
      
      // Avoid duplicates based on title (simple check)
      const exists = library.some(entry => entry.role === role && entry.scenario.title === scenario.title);
      if (exists) return;

      const newEntry: LibraryEntry = {
        id: crypto.randomUUID(),
        role,
        topic,
        scenario,
        createdAt: Date.now()
      };

      library.push(newEntry);
      
      // Limit library size to prevent localStorage overflow.
      // If exceeded, randomly remove an entry to make space for the new one (and to keep the pool fresh/rotating).
      while (library.length > MAX_LIBRARY_SIZE) {
        const randomIndex = Math.floor(Math.random() * library.length);
        library.splice(randomIndex, 1);
      }

      localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    } catch (e) {
      console.warn("Failed to save scenario to library", e);
    }
  },

  /**
   * Get a random scenario matching the role and topic.
   */
  getRandom: (role: ResearcherRole, topic: string): Scenario | null => {
    try {
      const stored = localStorage.getItem(LIBRARY_KEY);
      if (!stored) return null;

      const library: LibraryEntry[] = JSON.parse(stored);
      
      const matching = library.filter(entry => entry.role === role && entry.topic === topic);
      
      if (matching.length === 0) return null;

      // Pick random
      const entry = matching[Math.floor(Math.random() * matching.length)];
      return entry.scenario;
    } catch (e) {
      console.error("Failed to retrieve from library", e);
      return null;
    }
  },

  /**
   * Clear library (useful for debugging or version resets)
   */
  clear: () => {
    localStorage.removeItem(LIBRARY_KEY);
  }
};