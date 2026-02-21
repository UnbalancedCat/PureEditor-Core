import { Compartment } from "@codemirror/state"

// =============================================================================
// Configuration Registry
// =============================================================================
// We use Compartments for all dynamic settings. This allows us to strictly
// control the reconfiguration of specific parts of the editor state without
// rebuilding the entire Extension array.

// 1. Appearance & Theme
export const themeConfig = new Compartment()          // Editor Theme (Dark/Light)
export const highlightStyleConfig = new Compartment() // Syntax Highlighting Colors
export const fontSizeConfig = new Compartment()       // Font Size (Content & Gutters)

// 2. Editor Behavior
export const readOnlyConfig = new Compartment()       // Read-only / Editable state
export const wordWrapConfig = new Compartment()       // Line Wrapping
export const lineNumbersConfig = new Compartment()    // Line Numbers Gutter
export const languageConfig = new Compartment()       // Language Support
export const keymapConfig = new Compartment()         // Keyboard Shortcuts

// 3. Features
export const minimapConfig = new Compartment()        // Minimap
export const featureConfig = new Compartment()        // Linter, Autocomplete flags
export const historyConfig = new Compartment()        // Undo/Redo History
export const scrollMarginsConfig = new Compartment()  // Scroll Margins (for mobile padding)
