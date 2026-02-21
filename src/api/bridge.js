import { EditorApi } from "./index"
import { Logger } from "../logger"
import { DebugHelper } from "../utils/debug"

/**
 * Initialize the Legacy Bridge.
 * Maps global window functions to the modern EditorApi.
 * 
 * @param {EditorView} view - The CodeMirror EditorView instance
 */
export function initBridge(view) {
    const api = new EditorApi(view);

    // Expose the modern API globally for debugging or advanced usage
    window.editorApi = api;
    window.editorDebug = new DebugHelper(view);

    Logger.info("[Bridge] Initializing Legacy Bridge...");

    // 1. IO
    window.setContent = (text) => {
        Logger.debug("[Bridge] setContent called");
        api.setValue(text);
    };
    window.getContent = () => {
        Logger.debug("[Bridge] getContent called");
        return api.getValue();
    };

    // 2. Config
    window.setTheme = (isDark) => {
        Logger.debug(`[Bridge] setTheme called: ${isDark}`);
        api.setTheme(isDark);
    };
    window.setLanguage = (lang) => {
        Logger.debug(`[Bridge] setLanguage called: ${lang}`);
        api.setLanguage(lang);
    };

    // 3. Editor Config
    window.setReadOnly = (enable) => {
        Logger.debug(`[Bridge] setReadOnly called: ${enable}`);
        api.setReadOnly(enable);
    };
    window.setFontSize = (size) => {
        Logger.debug(`[Bridge] setFontSize called: ${size}`);
        api.setFontSize(size);
    };
    window.setWordWrap = (enable) => {
        Logger.debug(`[Bridge] setWordWrap called: ${enable}`);
        api.setWordWrap(enable);
    };
    window.setShowLineNumbers = (enable) => {
        Logger.debug(`[Bridge] setShowLineNumbers called: ${enable}`);
        api.setShowLineNumbers(enable);
    };

    // 4. Layout
    window.refreshLayout = () => {
        Logger.debug("[Bridge] refreshLayout called");
        api.refresh();
    };
    window.setBodyPadding = (bottom) => {
        // Logger.debug(`[Bridge] setBodyPadding: ${bottom}`);
        api.setPadding(bottom);
    };

    // 5. Editing Features
    window.undo = () => api.undo();
    window.redo = () => api.redo();
    window.insertText = (text) => api.insertText(text);
    window.moveCursor = (direction) => api.moveCursor(direction);

    // 6. Features (Phase 3)
    // Search
    window.updateSearchState = (keyword, replaceWord, isCaseSensitive, isRegexp, isWholeWord) => {
        // Logger.debug logic inside API
        api.updateSearchState(keyword, replaceWord, isCaseSensitive, isRegexp, isWholeWord);
    };
    window.findNext = () => api.findNext();
    window.findPrev = () => api.findPrev();
    window.replaceCurrent = () => api.replaceCurrent();
    window.replaceAll = () => api.replaceAll();
    window.closeSearch = () => api.closeSearch();

    // Mobile
    window.checkCursorVisibility = () => api.checkCursorVisibility();

    // Minimap
    window.toggleMinimap = (enable) => {
        Logger.debug(`[Bridge] toggleMinimap called: ${enable}`);
        api.toggleMinimap(enable);
    };
    // Phase 4: Stats & State
    window.getStats = () => api.getStats();
    window.saveViewState = () => api.saveViewState();
    window.restoreViewState = (jsonStr) => api.restoreViewState(jsonStr);

    // Initial log
    Logger.info("[Bridge] Legacy Bridge Ready");
}
