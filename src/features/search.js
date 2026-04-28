import { undo, redo } from "@codemirror/commands"
import { SearchQuery, setSearchQuery, getSearchQuery, openSearchPanel, closeSearchPanel } from "@codemirror/search"
import { Logger } from "../logger"

// --- Standard Commands ---
export { undo, redo }

// --- Search Feature ---
export function updateSearchState(view, keyword, replaceWord, isCaseSensitive, isRegexp, isWholeWord, shouldJump = true) {
    if (!view) return;

    Logger.debug(`[updateSearchState] Search: "${keyword}", Replace: "${replaceWord}", Case: ${isCaseSensitive}, Regex: ${isRegexp}, WholeWord: ${isWholeWord}`);

    // 1. Build Query
    const query = new SearchQuery({
        search: keyword,
        replace: replaceWord,
        caseSensitive: !!isCaseSensitive,
        regexp: !!isRegexp,
        wholeWord: !!isWholeWord
    });

    // 2. Dispatch Query
    view.dispatch({ effects: setSearchQuery.of(query) });

    // 3. Jump immediately if requested
    if (shouldJump && keyword) {
        view.focus();

        // Manual Jump Logic: Avoids "first run only opens panel" issue of findNext
        const cursor = query.getCursor(view.state);
        const { from, to } = view.state.selection.main;

        let match = cursor.next();
        let firstMatch = null;
        let nextMatch = null;

        // Iterate to find the match after current cursor
        while (!match.done) {
            if (!firstMatch) firstMatch = match.value;

            // Check if this match is after current selection
            if (match.value.from >= to) {
                nextMatch = match.value;
                break;
            }
            match = cursor.next();
        }

        // Wrap around fallback
        const target = nextMatch || firstMatch;

        if (target) {
            view.dispatch({
                selection: { anchor: target.from, head: target.to },
                scrollIntoView: true,
                effects: setSearchQuery.of(query) // Re-ensure state
            });
            Logger.debug(`[updateSearchState] Jumped to match at ${target.from}`);
        } else {
            Logger.debug(`[updateSearchState] No match found`);
        }
    }

    // 4. Log Stats
    logSearchStats(view);
}

export function logSearchStats(view) {
    const query = getSearchQuery(view.state);
    if (!query || !query.search) {
        if (window.editorHost && window.editorHost.onSearchResultChange) {
            try { window.editorHost.onSearchResultChange(0, 0); } catch(e) {}
        }
        return;
    }

    let total = 0, current = 0;
    try {
        const cursor = query.getCursor(view.state);
        const selectionHead = view.state.selection.main.head;
        let item = cursor.next();
        while (!item.done) {
            total++;
            if (item.value.from <= selectionHead) current = total;
            item = cursor.next();
        }
    } catch (e) {
        Logger.error("[logSearchStats] Error calculating stats:", e);
    }

    Logger.info(`[SearchStats] ${current}/${total}`);

    // Dispatch to ArkTS Host
    if (window.editorHost && window.editorHost.onSearchResultChange) {
        try {
            window.editorHost.onSearchResultChange(current, total);
        } catch (e) {
            Logger.error("[logSearchStats] Error dispatching to host:", e);
        }
    }
}
