import { ref, computed } from 'vue';

export interface KeyBindings {
  PITCH_UP: string;
  PITCH_DOWN: string;
  YAW_LEFT: string;
  YAW_RIGHT: string;
  ROLL_LEFT: string;
  ROLL_RIGHT: string;
  BOOST: string;
}

// Type for tracking the state of each keybinding (pressed or not)
export type KeyStates = Partial<Record<keyof KeyBindings, boolean>>;

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  PITCH_UP: 'w',
  PITCH_DOWN: 's',
  YAW_LEFT: 'q',
  YAW_RIGHT: 'e',
  ROLL_LEFT: 'a',
  ROLL_RIGHT: 'd',
  BOOST: ' ',
};

export const KEYBINDINGS_STORAGE_KEY = 'solarSystemKeyBindings_v1';

export const actionDisplayNames: Record<keyof KeyBindings, string> = {
  PITCH_UP: 'Pitch Up',
  PITCH_DOWN: 'Pitch Down',
  YAW_LEFT: 'Yaw Left',
  YAW_RIGHT: 'Yaw Right',
  ROLL_LEFT: 'Roll Left',
  ROLL_RIGHT: 'Roll Right',
  BOOST: 'Boost',
};

export const orderedActions = Object.keys(DEFAULT_KEY_BINDINGS) as Array<keyof KeyBindings>;


// Module-scoped state for singleton behavior
const currentKeyBindings = ref<KeyBindings>({ ...DEFAULT_KEY_BINDINGS });
const actionToRebind = ref<keyof KeyBindings | null>(null);
const isListeningForKey = computed(() => actionToRebind.value !== null);

  const loadKeyBindings = () => {
    const storedBindings = localStorage.getItem(KEYBINDINGS_STORAGE_KEY);
    if (storedBindings) {
      try {
        const parsedBindings = JSON.parse(storedBindings) as KeyBindings;
        currentKeyBindings.value = { ...DEFAULT_KEY_BINDINGS, ...parsedBindings };
      } catch (error) {
        console.error('Failed to parse key bindings from localStorage:', error);
        currentKeyBindings.value = { ...DEFAULT_KEY_BINDINGS };
      }
    } else {
      currentKeyBindings.value = { ...DEFAULT_KEY_BINDINGS };
    }
  };

  const saveKeyBindings = () => {
    try {
      localStorage.setItem(KEYBINDINGS_STORAGE_KEY, JSON.stringify(currentKeyBindings.value));
    } catch (error) {
      console.error('Failed to save key bindings to localStorage:', error);
    }
  };

  const getDisplayKey = (key: string): string => {
    if (key === ' ') return 'SPACE';
    if (key.length === 1) return key.toUpperCase();
    return key;
  };

  const startRebind = (action: keyof KeyBindings) => {
    actionToRebind.value = action;
  };

  const cancelRebind = () => {
    actionToRebind.value = null;
  };

  const setBinding = (action: keyof KeyBindings, newKey: string) => {
    // Ensure we are actually rebinding the correct action
    if (actionToRebind.value === action) {
      const lowerNewKey = newKey.toLowerCase();
      if (lowerNewKey === 'enter' || lowerNewKey === 'escape') {
        console.warn(`Cannot bind action to '${lowerNewKey}'. It's a reserved key.`);
        actionToRebind.value = null; // Cancel rebind if disallowed key is pressed
        return;
      }
      currentKeyBindings.value[action] = lowerNewKey;
      actionToRebind.value = null; // Stop listening after successful rebind
    }
  };
  
  const resetToDefaultKeyBindings = () => {
    currentKeyBindings.value = { ...DEFAULT_KEY_BINDINGS };
    saveKeyBindings(); // Save the reset state immediately
  };



export function useKeybindings() {
  // Load bindings only if they haven't been loaded yet for this shared state
  // This check is simple; more robust would be a boolean flag.
  if (Object.keys(currentKeyBindings.value).every(key => currentKeyBindings.value[key as keyof KeyBindings] === DEFAULT_KEY_BINDINGS[key as keyof KeyBindings])) {
    const storedBindings = localStorage.getItem(KEYBINDINGS_STORAGE_KEY);
    if (!storedBindings) { // Only call loadKeyBindings if no localStorage implies first ever load or reset.
        loadKeyBindings(); // Initial load if not already populated from localStorage by another instance
    }
  }

  return {
    currentKeyBindings,
    DEFAULT_KEY_BINDINGS, // Exporting for potential comparison or display
    actionDisplayNames,
    orderedActions,
    actionToRebind,
    isListeningForKey,
    loadKeyBindings, // Might not be needed externally if loaded on init
    saveKeyBindings,
    getDisplayKey,
    startRebind,
    cancelRebind,
    setBinding,
    resetToDefaultKeyBindings
  };
}

// Initial load of keybindings when the module is first imported.
// This ensures that localStorage is checked as soon as the app starts using this composable.
{
    const storedBindings = localStorage.getItem(KEYBINDINGS_STORAGE_KEY);
    if (storedBindings) {
        try {
            const parsedBindings = JSON.parse(storedBindings) as KeyBindings;
            currentKeyBindings.value = { ...DEFAULT_KEY_BINDINGS, ...parsedBindings };
            console.log('[useKeybindings] Singleton: Loaded bindings from localStorage on module import.');
        } catch (error) {
            console.error('[useKeybindings] Singleton: Failed to parse key bindings from localStorage on module import:', error);
            currentKeyBindings.value = { ...DEFAULT_KEY_BINDINGS };
        }
    } else {
        console.log('[useKeybindings] Singleton: No bindings in localStorage on module import, using defaults.');
        currentKeyBindings.value = { ...DEFAULT_KEY_BINDINGS };
    }
}
