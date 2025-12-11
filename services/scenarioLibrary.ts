
import { ResearcherRole, Scenario } from "../types";
import { SEED_SCENARIOS } from "./seedScenarios";

const LIBRARY_KEY = 'ethix_scenario_library_v3'; // Bumped version for new schema (embedded language support)
const MAX_LIBRARY_SIZE = 150; // Increased limit to accommodate multiple languages

interface LibraryEntry {
  id: string;
  role: ResearcherRole;
  topic: string;
  language: string;
  scenario: Scenario;
  createdAt: number;
}

export const ScenarioLibrary = {
  /**
   * Save a generated scenario to the local library for future reuse.
   */
  add: (role: ResearcherRole, topic: string, scenario: Scenario, language: string) => {
    try {
      const stored = localStorage.getItem(LIBRARY_KEY);
      let library: LibraryEntry[] = stored ? JSON.parse(stored) : [];
      
      // Avoid duplicates based on title (simple check)
      const exists = library.some(entry => 
        entry.role === role && 
        entry.scenario.title === scenario.title &&
        entry.language === language
      );
      if (exists) return;

      const newEntry: LibraryEntry = {
        id: crypto.randomUUID(),
        role,
        topic,
        language,
        scenario,
        createdAt: Date.now()
      };

      library.push(newEntry);
      
      // Limit library size to prevent localStorage overflow.
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
   * Get a random scenario matching the role, topic, AND language.
   */
  getRandom: (role: ResearcherRole, topic: string, language: string): Scenario | null => {
    try {
      const stored = localStorage.getItem(LIBRARY_KEY);
      if (!stored) return null;

      const library: LibraryEntry[] = JSON.parse(stored);
      
      const matching = library.filter(entry => 
        entry.role === role && 
        entry.topic === topic && 
        entry.language === language
      );
      
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
   * Ensure the library has seed scenarios for instant start.
   */
  ensureSeeds: () => {
    try {
      const stored = localStorage.getItem(LIBRARY_KEY);
      let library: LibraryEntry[] = stored ? JSON.parse(stored) : [];

      // If library is relatively empty, inject seeds
      // Note: We check if ANY seeds exist to prevent re-injecting 100+ items every reload
      if (library.length < 10) {
        console.log("Seeding scenario library with default content for all languages...");
        
        SEED_SCENARIOS.forEach(seed => {
            const exists = library.some(entry => 
                entry.role === seed.role && 
                entry.scenario.title === seed.scenario.title &&
                entry.language === seed.language
            );
            
            if (!exists) {
                library.push({
                    id: crypto.randomUUID(),
                    role: seed.role,
                    topic: seed.topic,
                    language: seed.language,
                    scenario: seed.scenario,
                    createdAt: Date.now()
                });
            }
        });
        localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
      }
    } catch (e) {
      console.error("Failed to seed library", e);
    }
  },

  /**
   * Clear library (useful for debugging or version resets)
   */
  clear: () => {
    localStorage.removeItem(LIBRARY_KEY);
  }
};
