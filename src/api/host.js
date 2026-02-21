import { Logger } from "../logger"

/**
 * EditorHost
 * Standardized interface for Core -> Host (ArkTS) communication.
 * Wraps the legacy `window.editorProxy` and new `window.editorHost`.
 */
export class EditorHost {
    constructor() {
        this.Logger = Logger;
        // Bind methods to this to avoid context issues
        this.onEditorReady = this.onEditorReady.bind(this);
        this.onContentChange = this.onContentChange.bind(this);
        this.onHistoryStateChange = this.onHistoryStateChange.bind(this);
        this.onSearchResultChange = this.onSearchResultChange.bind(this);
        this.dispatchCommand = this.dispatchCommand.bind(this);
    }

    /**
     * Notify Host that editor is ready
     */
    onEditorReady() {
        Logger.info("[Host] onEditorReady");

        // 1. Try Standard API
        if (window.editorHost && window.editorHost.onEditorReady) {
            window.editorHost.onEditorReady();
        }
        // 2. Fallback to Legacy API
        else if (window.editorProxy && window.editorProxy.onEditorReady) {
            window.editorProxy.onEditorReady();
        }
    }

    /**
     * Notify Host of content changes
     * @param {boolean} isDirty 
     */
    onContentChange(isDirty) {
        // Logger.debug(`[Host] onContentChange: ${isDirty}`);

        if (window.editorHost && window.editorHost.onContentChange) {
            window.editorHost.onContentChange(isDirty);
        }
        else if (window.editorProxy && window.editorProxy.onContentChange) {
            window.editorProxy.onContentChange(isDirty);
        }
    }

    /**
     * Notify Host of history stack changes
     * @param {boolean} canUndo 
     * @param {boolean} canRedo 
     */
    onHistoryStateChange(canUndo, canRedo) {
        // Logger.debug(`[Host] onHistoryStateChange: ${canUndo}, ${canRedo}`);

        if (window.editorHost && window.editorHost.onHistoryStateChange) {
            window.editorHost.onHistoryStateChange(canUndo, canRedo);
        }
        else if (window.editorProxy && window.editorProxy.onHistoryStateChange) {
            window.editorProxy.onHistoryStateChange(canUndo, canRedo);
        }
    }

    /**
     * Notify Host of search result updates
     * @param {number} current 
     * @param {number} total 
     */
    onSearchResultChange(current, total) {
        if (window.editorHost && window.editorHost.onSearchResultChange) {
            window.editorHost.onSearchResultChange(current, total);
        }
        else if (window.editorProxy && window.editorProxy.onSearchResultChange) {
            window.editorProxy.onSearchResultChange(current, total);
        }
    }

    /**
     * Dispatch a generic command to the Host
     * @param {string} commandId 
     * @returns {boolean} true if handled
     */
    dispatchCommand(commandId) {
        Logger.info(`[Host] dispatchCommand: ${commandId}`);

        // 1. Standard API
        if (window.editorHost && window.editorHost.dispatchCommand) {
            window.editorHost.dispatchCommand(commandId);
            return true;
        }

        // 2. Legacy API Mapping (Backward Compatibility)
        if (window.editorProxy) {
            switch (commandId) {
                case "file.new": return this._callLegacy("triggerNewFile");
                case "file.open": return this._callLegacy("triggerOpenFile");
                case "file.save": return this._callLegacy("triggerSaveFile");
                case "file.saveAs": return this._callLegacy("triggerSaveAs");
                case "file.close": return this._callLegacy("triggerCloseFile");
                case "view.toggleSidebar": return this._callLegacy("triggerToggleSidebar");
                case "view.openSettings": return this._callLegacy("triggerOpenSettings");
                case "view.openAbout": return this._callLegacy("triggerOpenAbout");
                case "help.shortcuts": return this._callLegacy("triggerShowShortcuts");
                case "view.fileManager": return this._callLegacy("triggerOpenFileManager");
                case "view.render": return this._callLegacy("triggerRender");
                default:
                    Logger.warn(`[Host] Legacy bridge does not support command: ${commandId}`);
                    return false;
            }
        }
        return false;
    }

    _callLegacy(method) {
        if (window.editorProxy[method]) {
            window.editorProxy[method]();
            return true;
        }
        return false;
    }
}
