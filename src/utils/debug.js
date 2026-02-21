import { Logger } from "../logger"

/**
 * Debug Helper
 * Introspects the EditorView state.
 */
export class DebugHelper {
    constructor(view) {
        this.view = view;
    }

    dumpState() {
        if (!this.view) return;

        const state = this.view.state;
        const selection = state.selection.main;

        Logger.info("=== Editor State Dump ===");
        Logger.info(`Doc Length: ${state.doc.length}`);
        Logger.info(`Selection: From ${selection.from} To ${selection.to} (Empty: ${selection.empty})`);

        // Check active compartments if possible (requires reference, harder without WeakMap, 
        // but we can check values of known facets)

        Logger.info("=== Configuration Facets ===");
        // Check ReadOnly
        Logger.info(`ReadOnly: ${state.readOnly}`);

        // Search Query
        import("@codemirror/search").then(({ getSearchQuery }) => {
            const query = getSearchQuery(state);
            Logger.info("Search Query:", query);
        });

        // Toggle Active Line (for testing selection conflict)
        Logger.info("Tip: Run window.debug.toggleActiveLine() to test selection conflict.");
    }

    // Heuristics to debug visual issues
    toggleActiveLine(enable) {
        Logger.info(`[Debug] toggleActiveLine: ${enable} (Note: This is a stub, real toggling requires compartment access)`);
    }

    checkSearchState() {
        import("@codemirror/search").then(({ getSearchQuery, SearchQuery }) => {
            if (!this.view) return;
            const state = this.view.state;
            const query = getSearchQuery(state);
            Logger.info("=== Search State ===");
            Logger.info("Current Query Object:", query);
            Logger.info("Query String:", query.search);

            // Check if search panel is open (via effects? No easy way to check panel state from here without dom)
            const panel = this.view.dom.querySelector(".cm-search");
            Logger.info("Search Panel DOM:", panel ? "Visible" : "Hidden");

            // Create a test query to verify effect dispatch works
            // this.view.dispatch({ effects: setSearchQuery.of(new SearchQuery({ search: "test" })) });
        });
    }
}
