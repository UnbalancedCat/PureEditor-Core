import { Logger } from "../logger"

/**
 * Mobile-specific features (Scrolling, Cursor Visibility Hacks)
 */

/**
 * Check if cursor is visible in the viewport.
 * @param {EditorView} view 
 * @returns {boolean}
 */
export function checkCursorVisibility(view) {
    if (!view) return false;

    const selection = view.state.selection.main;
    const pos = selection.head;
    const coords = view.coordsAtPos(pos);

    if (!coords) return false;

    // Viewport relative coordinates
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Simple check: is point within the visible box?
    // Note: This matches legacy logic which cares mainly about vertical visibility
    const isVisible = (
        coords.top >= 0 &&
        coords.bottom <= viewportHeight &&
        coords.left >= 0 &&
        coords.right <= viewportWidth
    );

    // Logger.debug(`[Mobile] checkCursorVisibility: ${isVisible} (Top:${coords.top}, Bottom:${coords.bottom})`);
    return isVisible;
}

/**
 * Handle Scroll Push Cursor (Legacy Logic)
 * When typing near the bottom of the screen on mobile (virtual keyboard open),
 * we might need to push the scroll to keep the cursor visible.
 * 
 * @param {EditorView} view 
 * @param {number} paddingBottom - Additional padding (e.g. for toolbar)
 */
export function handleScrollPushCursor(view, paddingBottom = 0) {
    if (!view) return;

    const selection = view.state.selection.main;
    const pos = selection.head;
    const coords = view.coordsAtPos(pos);

    if (!coords) return;

    const viewportHeight = window.innerHeight;
    const threshold = viewportHeight - paddingBottom - 50; // Safety margin

    if (coords.bottom > threshold) {
        Logger.debug("[Mobile] handleScrollPushCursor: Auto-scrolling to keep cursor visible");
        view.dispatch({
            selection: { anchor: pos, head: pos },
            scrollIntoView: true,
            userEvent: "scroll" // Mark as user event to trigger listeners if needed
        });
    }
}
