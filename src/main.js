import { EditorView } from "codemirror"
import { EditorState } from "@codemirror/state"
import { Logger } from "./logger"
import { initBridge } from "./api/bridge"
import { EditorHost } from "./api/host" // [New]
import { getHostKeymap } from "./keymaps" // [New]
import {
    themeConfig, highlightStyleConfig, fontSizeConfig,
    readOnlyConfig, wordWrapConfig, lineNumbersConfig,
    languageConfig, featureConfig, minimapConfig,
    keymapConfig, scrollMarginsConfig, historyConfig
} from "./configuration"

// Languages & Themes (Basic imports for initial state)
import { defaultLanguage } from "./languages"
import { customLightTheme, customLightHighlightStyle, baseTheme } from "./themes"
import { syntaxHighlighting } from "@codemirror/language"
import { history, undoDepth, redoDepth } from "@codemirror/commands"
import { search } from "@codemirror/search"
import { logSearchStats } from "./features/search"
import { lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from "@codemirror/view"

// 0. Initialize Host Interface
const host = new EditorHost();

// 1. Assemble Extensions via Compartments
const myExtensions = [
    // Essentials
    highlightSpecialChars(),
    historyConfig.of(history()),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    search(), // Revert to default search to rule out config issues

    // Dynamic Configurations
    lineNumbersConfig.of(lineNumbers()),
    readOnlyConfig.of(EditorView.editable.of(true)),
    wordWrapConfig.of([]),
    fontSizeConfig.of([]),
    scrollMarginsConfig.of(EditorView.scrollMargins.of(() => ({ top: 0, bottom: 0 }))),

    // Features (Placeholders for now)
    minimapConfig.of([]),
    featureConfig.of([]),
    keymapConfig.of(getHostKeymap(host)), // [New] Inject Host Keymap

    // Theme & Language
    baseTheme,
    themeConfig.of(customLightTheme),
    highlightStyleConfig.of(syntaxHighlighting(customLightHighlightStyle)),
    languageConfig.of(defaultLanguage),

    // Update Listener
    EditorView.updateListener.of((update) => {
        // 1. Content Change
        if (update.docChanged) {
            // Check if the change was programmatic (e.g. from setValue)
            let isProgrammatic = false;
            for (let tr of update.transactions) {
                if (tr.isUserEvent("programmatic")) {
                    isProgrammatic = true;
                    break;
                }
            }
            if (!isProgrammatic) {
                host.onContentChange(true);
            }
        }

        // 2. History State Change
        if (update.docChanged || update.selectionSet) {
            const canUndo = undoDepth(update.state) > 0;
            const canRedo = redoDepth(update.state) > 0;
            host.onHistoryStateChange(canUndo, canRedo);
            logSearchStats(update.view); // Continually sync search results if doc or selection changed
        }

        // 3. View Update (Scroll/Cursor) - Throttled in Host if needed
        // host.onViewUpdate(...) 
    })
];

// 2. Create State
Logger.info("[main] Creating EditorState...");
const state = EditorState.create({
    doc: "",
    extensions: myExtensions
})

// 3. Create View
Logger.info("[main] Creating EditorView...");
const view = new EditorView({
    state,
    parent: document.getElementById("editor")
})

// 4. Initialize Bridge
Logger.info("[main] Initializing Bridge...");
initBridge(view);

// 5. Notify Host Ready
host.onEditorReady();

Logger.info("[main] Core Skeleton Initialized");

// --- DEBUG & SHIM INSTRUMENTATION ---
const debugEvents = ['pointerdown', 'mousedown', 'touchstart', 'touchmove', 'wheel'];
const editorDiv = document.getElementById("editor");
if (editorDiv) {
    // Shim: Detect "Mouse masquerading as Touch"
    const isLikelyMouse = (e) => {
        // If it's already mouse, ignore
        if (e.pointerType === 'mouse') return false;

        const w = e.width || 0;
        const h = e.height || 0;
        const p = e.pressure || 0;

        // Heuristic for HarmonyOS Tablet Mouse:
        // Reported as 'touch' but with fixed geometry (50x50) and 0 pressure.
        const isTabletMouse = (w === 50 && h === 50 && p === 0);

        // Also keep the small radius check just in case (e.g. Stylus)
        const isSmallRadius = (w <= 1 && h <= 1);

        if (isTabletMouse || isSmallRadius) {
            return true;
        }
        return false;
    };

    editorDiv.addEventListener('pointerdown', (e) => {
        let isShimmed = false;
        let originalType = e.pointerType;

        // Apply Shim
        if (e.pointerType === 'touch' && isLikelyMouse(e)) {
            try {
                // Force CodeMirror to see this as a mouse event
                Object.defineProperty(e, 'pointerType', { get: () => 'mouse' });
                isShimmed = true;
                Logger.info(`[Shim] Rewrote pointerType 'touch' -> 'mouse' (w=${e.width} h=${e.height} p=${e.pressure})`);
            } catch (err) {
                Logger.error(`[Shim] Failed to rewrite: ${err}`);
            }
        }

        // Log only shimmed events or critical failures to reduce noise
        if (isShimmed) {
            // This log is already handled above within the try-catch block for shimmed events.
            // The original log below is more verbose and includes non-shimmed events,
            // which the instruction implies we should reduce.
            // Keeping the new log from the instruction and removing the old verbose one.
        } else if (originalType) { // Log original type if not shimmed, for debugging non-shimmed touch events
            // This part is removed as per the instruction to reduce noise.
            // The instruction implies only logging shimmed events or critical failures.
        }
        // The instruction's example for the pointerdown listener only includes the shimmed log.
        // So, I'll remove the verbose logging for non-shimmed events.
    }, { capture: true });

    // Log other events generally
    ['mousedown', 'touchstart', 'touchmove', 'wheel'].forEach(eventType => {
        editorDiv.addEventListener(eventType, (e) => {
            // Reduce noise
            if (eventType === 'touchmove') return;
            Logger.info(`[Input] ${eventType}`);
        }, { capture: true });
    });
}
// -----------------------------
