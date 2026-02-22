import { EditorView } from "codemirror"
import { EditorSelection, Transaction } from "@codemirror/state"
import { Logger } from "../logger"
import {
    themeConfig, highlightStyleConfig, fontSizeConfig,
    readOnlyConfig, wordWrapConfig, lineNumbersConfig,
    languageConfig, featureConfig, minimapConfig,
    keymapConfig
} from "../configuration"
import { getLanguageExtension } from "../languages"
import { getThemeExtension } from "../themes"
import { updateSearchState } from "../features/search"
import { checkCursorVisibility } from "../features/mobile"
import { showMinimap } from "@replit/codemirror-minimap"
import { EditorView as View } from "@codemirror/view"
import { lineNumbers } from "@codemirror/view"
import { setSearchQuery, SearchQuery } from "@codemirror/search"
import { autocompletion } from "@codemirror/autocomplete"
import { lintGutter, linter } from "@codemirror/lint"
import { syntaxTree } from "@codemirror/language"

/**
 * Generic syntax error checker (Lezer Parser Linter)
 */
const syntaxLinter = linter((view) => {
    let diagnostics = [];
    // Traverse the syntax tree looking for nodes marked as "Error"
    syntaxTree(view.state).cursor().iterate((node) => {
        if (node.type.isError) {
            diagnostics.push({
                from: node.from,
                to: node.to,
                severity: "error", // Mark as error
                message: "Syntax Error", // Tooltip message
                actions: []
            });
        }
    });
    return diagnostics;
});

/**
 * Modern Editor API
 * Encapsulates all interactions with the EditorView.
 */
export class EditorApi {
    constructor(view) {
        this.view = view;
        this.Logger = Logger;
        Logger.info("[API] EditorApi Instantiated");
    }

    // ... (rest of the class)

    /**
     * API Ready Check
     */
    isReady() {
        const ready = !!this.view;
        // Logger.debug(`[API] isReady: ${ready}`); // Optional: commented out to avoid spam if polled
        return ready;
    }

    // --- Core IO ---

    /**
     * Set editor content securely.
     * @param {string} text 
     */
    setValue(text) {
        if (!this.view) {
            Logger.warn("[API] setValue: Editor not ready");
            return;
        }

        Logger.debug(`[API] setValue: Length=${text.length}`);

        this.view.dispatch({
            changes: { from: 0, to: this.view.state.doc.length, insert: text },
            annotations: [
                Transaction.addToHistory.of(false),
                Transaction.userEvent.of("programmatic")
            ]
        });
    }

    /**
     * Get current editor content.
     * @returns {string}
     */
    getValue() {
        if (!this.view) {
            Logger.warn("[API] getValue: Editor not ready");
            return "";
        }
        const content = this.view.state.doc.toString();
        Logger.debug(`[API] getValue: Length=${content.length}`);
        return content;
    }

    // --- Configuration ---

    /**
     * Configure Theme
     * @param {boolean} isDark 
     */
    setTheme(isDark) {
        if (!this.view) return;
        Logger.info(`[API] setTheme: ${isDark ? 'Dark' : 'Light'}`);

        const { theme, highlight } = getThemeExtension(isDark);

        this.view.dispatch({
            effects: [
                themeConfig.reconfigure(theme),
                highlightStyleConfig.reconfigure(highlight)
            ]
        });

        // Update body for seamless transition
        document.body.style.backgroundColor = isDark ? "#1E1E1E" : "#FFFFFF";
    }

    /**
     * Configure Language
     * @param {string} langId 
     */
    setLanguage(langId) {
        if (!this.view) return;
        Logger.info(`[API] setLanguage: ${langId}`);

        const extension = getLanguageExtension(langId);

        this.view.dispatch({
            effects: languageConfig.reconfigure(extension)
        });
    }

    /**
     * Set Font Size
     * @param {number} sizePx 
     */
    setFontSize(sizePx) {
        if (!this.view) return;
        Logger.info(`[API] setFontSize: ${sizePx}px`);

        // We use EditorView.theme to set the font size on the top-level element
        const theme = EditorView.theme({
            "&": { fontSize: sizePx + "px" }
        });

        this.view.dispatch({
            effects: fontSizeConfig.reconfigure(theme)
        });
    }

    /**
     * Set Read Only
     * @param {boolean} readOnly 
     */
    setReadOnly(readOnly) {
        if (!this.view) return;
        Logger.info(`[API] setReadOnly: ${readOnly}`);

        this.view.dispatch({
            effects: readOnlyConfig.reconfigure(EditorView.editable.of(!readOnly))
        });

        // Also update DOM contenteditable just safely
        this.view.contentDOM.contentEditable = String(!readOnly);
    }

    /**
     * Set Word Wrap
     * @param {boolean} enable 
     */
    setWordWrap(enable) {
        if (!this.view) return;
        Logger.info(`[API] setWordWrap: ${enable}`);

        const extension = enable ? EditorView.lineWrapping : [];
        this.view.dispatch({
            effects: wordWrapConfig.reconfigure(extension)
        });
    }

    /**
     * Set Show Line Numbers
     * @param {boolean} enable 
     */
    setShowLineNumbers(enable) {
        if (!this.view) return;
        Logger.info(`[API] setShowLineNumbers: ${enable}`);

        const extension = enable ? lineNumbers() : [];
        this.view.dispatch({
            effects: lineNumbersConfig.reconfigure(extension)
        });
    }

    /**
     * Set Editor Extension Config (Lint, Autocomplete)
     * @param {boolean} enableLint
     * @param {boolean} enableAutocomplete
     */
    setEditorConfig(enableLint, enableAutocomplete) {
        if (!this.view) return;
        Logger.info(`[API] setEditorConfig: Lint=${enableLint}, Auto=${enableAutocomplete}`);

        let extensions = [];
        if (enableAutocomplete) {
            extensions.push(autocompletion());
        }
        if (enableLint) {
            extensions.push(lintGutter());
            extensions.push(syntaxLinter); // Inject the missing syntax checker
        }

        this.view.dispatch({
            effects: featureConfig.reconfigure(extensions)
        });
    }

    /**
     * Refresh Layout
     */
    refresh() {
        if (!this.view) return;
        Logger.debug("[API] refresh");
        this.view.requestMeasure();
    }

    /**
     * Set Shortcuts Enabled
     * @param {boolean} enable
     */
    setShortcutsEnabled(enable) {
        // Stub for now, preventing crash
        // Logger.info(`[API] setShortcutsEnabled: ${enable} (Not Implemented)`);
    }

    /**
     * Save View State (Selection & Scroll)
     * @returns {string} JSON string
     */
    saveViewState() {
        if (!this.view) return "{}";

        const scroll = {
            scrollTop: this.view.scrollDOM.scrollTop,
            scrollLeft: this.view.scrollDOM.scrollLeft
        };

        const state = {
            selection: this.view.state.selection.toJSON(),
            scroll: scroll
        };

        Logger.debug("[API] saveViewState");
        return JSON.stringify(state);
    }

    /**
     * Restore View State
     * @param {string} jsonStr 
     */
    restoreViewState(jsonStr) {
        if (!this.view || !jsonStr) return;
        try {
            const state = JSON.parse(jsonStr);
            Logger.debug("[API] restoreViewState");

            // 1. Restore Selection
            if (state.selection) {
                const selection = EditorSelection.fromJSON(state.selection);
                this.view.dispatch({ selection });
            }

            // 2. Restore Scroll
            if (state.scroll) {
                this.view.scrollDOM.scrollTop = state.scroll.scrollTop;
                this.view.scrollDOM.scrollLeft = state.scroll.scrollLeft;
            }
        } catch (e) {
            Logger.error("[API] restoreViewState failed:", e);
        }
    }

    // --- Features (Phase 3) ---

    /**
     * Get Editor Statistics
     * @returns {string} JSON string { lines, length, chars, charsNoSpace, words, selection: { from, to } }
     */
    getStats() {
        if (!this.view) return "{}";
        const state = this.view.state;
        const doc = state.doc;
        const text = doc.toString();

        const stats = {
            lines: doc.lines,
            length: text.length,
            // Simple word count approximation
            words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
            chars: text.length,
            charsNoSpace: text.replace(/\s/g, "").length,
            selection: {
                from: state.selection.main.from,
                to: state.selection.main.to
            }
        };

        // Logger.debug("[API] getStats", stats);
        return JSON.stringify(stats);
    }


    /**
     * Update Search State
     * Uses CodeMirror 6 State Effects (No CSS hacks)
     */
    updateSearchState(keyword, replaceWord, isCaseSensitive, isRegexp, isWholeWord) {
        if (!this.view) return;
        Logger.info(`[API] updateSearchState: "${keyword}"`);
        updateSearchState(this.view, keyword, replaceWord, isCaseSensitive, isRegexp, isWholeWord, true);
    }

    findNext() {
        if (!this.view) return;
        Logger.debug("[API] findNext");
        // We use the search command from main (if bound) or manual dispatch
        // For simplicity, we can rely on standard commands if keymap is effective,
        // but since we want direct control:
        import("@codemirror/search").then(({ findNext }) => {
            findNext(this.view);
        });
    }

    findPrev() {
        if (!this.view) return;
        Logger.debug("[API] findPrev");
        import("@codemirror/search").then(({ findPrevious }) => {
            findPrevious(this.view);
        });
    }

    replaceCurrent() {
        if (!this.view) return;
        Logger.debug("[API] replaceCurrent");
        import("@codemirror/search").then(({ replaceNext }) => {
            replaceNext(this.view);
        });
    }

    replaceAll() {
        if (!this.view) return;
        Logger.debug("[API] replaceAll");
        import("@codemirror/search").then(({ replaceAll }) => {
            replaceAll(this.view);
        });
    }

    closeSearch() {
        if (!this.view) return;
        Logger.info("[API] closeSearch");

        // 1. Clear query
        this.view.dispatch({ effects: setSearchQuery.of(new SearchQuery({ search: "" })) });

        // 2. Collapse selection to cursor (remove highlight)
        const { head } = this.view.state.selection.main;
        this.view.dispatch({
            selection: { anchor: head, head: head }
        });

        // 3. Close panel
        import("@codemirror/search").then(({ closeSearchPanel }) => {
            closeSearchPanel(this.view);
        });
    }

    /**
     * Mobile: Check Cursor Visibility
     */
    checkCursorVisibility() {
        if (!this.view) return false;
        const visible = checkCursorVisibility(this.view);
        Logger.debug(`[API] checkCursorVisibility: ${visible}`);
        return visible;
    }

    /**
     * Toggle Minimap
     * @param {boolean} enable 
     */
    toggleMinimap(enable) {
        if (!this.view) return;
        Logger.info(`[API] toggleMinimap: ${enable}`);

        if (typeof showMinimap === 'undefined') {
            Logger.error("[API] showMinimap is undefined. Check @replit/codemirror-minimap installation.");
            return;
        }

        // Use @replit/codemirror-minimap
        // showMinimap is a Facet, so we use compute or of.
        // The library requires a create function that returns a DOM element.
        const extension = enable ? showMinimap.compute(['doc'], (state) => {
            return {
                create: () => {
                    const dom = document.createElement("div");
                    // The library will handle rendering into this div
                    return { dom };
                },
                showOverlay: "always",
                displayText: "blocks"
            }
        }) : [];

        this.view.dispatch({
            effects: minimapConfig.reconfigure(extension)
        });
        Logger.debug(`[API] toggleMinimap: Dispatched (Enable: ${enable})`);
    }

    /**
     * API Ready Check
     */
    isReady() {
        // Logger.debug(`[API] isReady check`);
        return !!this.view;
    }

    // --- Editing --

    undo() {
        if (!this.view) return;
        import("@codemirror/commands").then(({ undo }) => undo(this.view));
    }

    redo() {
        if (!this.view) return;
        import("@codemirror/commands").then(({ redo }) => redo(this.view));
    }

    /**
     * Insert text at current cursor position
     * @param {string} text 
     */
    insertText(text) {
        if (!this.view) return;
        const state = this.view.state;
        const selection = state.selection.main;

        this.view.dispatch({
            changes: { from: selection.from, to: selection.to, insert: text },
            selection: { anchor: selection.from + text.length },
            scrollIntoView: true
        });
    }

    /**
     * Handle inserting a bracket matching pair (e.g. () or [])
     * @param {string} left 
     * @param {string} right 
     */
    insertBracket(left, right) {
        if (!this.view) return;
        const state = this.view.state;
        const selection = state.selection.main;

        if (!selection.empty) {
            // Has selection: Wrap the selected text
            const selectedText = state.sliceDoc(selection.from, selection.to);
            const newText = left + selectedText + right;
            this.view.dispatch(state.update({
                changes: { from: selection.from, to: selection.to, insert: newText },
                // Keep the inner text selected
                selection: { anchor: selection.from + left.length, head: selection.to + left.length },
                scrollIntoView: true
            }));
        } else {
            // No selection: Insert pair and put cursor in the middle
            const newText = left + right;
            const pos = selection.from;
            this.view.dispatch(state.update({
                changes: { from: pos, insert: newText },
                selection: { anchor: pos + left.length },
                scrollIntoView: true
            }));
        }
    }

    /**
     * Handle Tab key insertion (smart indent / spaces)
     */
    insertTab() {
        if (!this.view) return;
        import("@codemirror/commands").then(({ insertTab }) => insertTab(this.view) || true);
    }

    /**
     * Move cursor
     * @param {'up'|'down'|'left'|'right'} direction 
     */
    moveCursor(direction) {
        if (!this.view) return;

        // Use standard commands for better handling (bidi, etc)
        import("@codemirror/commands").then(cmds => {
            switch (direction) {
                case 'up': cmds.cursorLineUp(this.view); break;
                case 'down': cmds.cursorLineDown(this.view); break;
                case 'left': cmds.cursorCharLeft(this.view); break;
                case 'right': cmds.cursorCharRight(this.view); break;
            }
        });
    }

    // --- Layout ---

    /**
     * Set Bottom Padding (for Virtual Keyboard/Toolbar)
     * @param {number} bottom 
     */
    setPadding(bottom) {
        // We set it on the body to allow the editor to scroll "past" the content
        document.body.style.paddingBottom = `${bottom}px`;
    }

    /**
     * Reset Cursor to Start (0,0)
     */
    resetCursorToStart() {
        if (!this.view) return;
        this.view.dispatch({
            selection: { anchor: 0, head: 0 },
            scrollIntoView: true
        });
    }
}
