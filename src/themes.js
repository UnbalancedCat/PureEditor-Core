import { EditorView } from "codemirror"
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language"
import { tags as t } from "@lezer/highlight"

// --- Base Theme (Layout & Structure) ---
export const baseTheme = EditorView.theme({
    "&": {
        fontSize: "14px",
        height: "100%",
    },
    // Scrollbar Structure
    ".cm-scroller": { overflow: "auto" },
    ".cm-content": { fontFamily: "'Fira Code', Consolas, monospace" },

    // Scrollbar Webkit Styles
    "& ::-webkit-scrollbar": {
        width: "14px",
        height: "14px",
        backgroundColor: "transparent"
    },
    "& ::-webkit-scrollbar-track": {
        backgroundColor: "transparent"
    },
    "& ::-webkit-scrollbar-corner": {
        backgroundColor: "transparent"
    },
    "& ::-webkit-scrollbar-thumb": {
        backgroundClip: "content-box",
        border: "3px solid transparent",
    },
    "& ::-webkit-scrollbar-thumb:vertical": {
        borderRight: "6px solid transparent",
        borderRadius: "5.5px 8.5px 8.5px 5.5px / 5.5px",
        minHeight: "30px"
    },
    "& ::-webkit-scrollbar-thumb:horizontal": {
        borderBottom: "6px solid transparent",
        borderRadius: "5.5px / 5.5px 5.5px 8.5px 8.5px",
        minWidth: "30px"
    },

    // Line Number Structure
    ".cm-lineNumbers .cm-gutterElement": {
        padding: "0 4px"
    }
});

// --- Highlight Styles (Ported from Reference) ---

export const customDarkHighlightStyle = HighlightStyle.define([
    { tag: t.keyword, color: "#569CD6" },
    { tag: t.controlKeyword, color: "#C586C0" },
    { tag: t.operator, color: "#D4D4D4" },
    { tag: t.color, color: "#ce9178" },
    { tag: t.string, color: "#98C379" },
    { tag: t.regexp, color: "#d16969" },
    { tag: t.url, color: "#40A4FF", textDecoration: "underline" },
    { tag: t.className, color: "#E5C07B" },
    { tag: t.comment, color: "#6A9955", fontStyle: "italic" },
    { tag: t.variableName, color: "#9CDCFE" },
    { tag: t.typeName, color: "#4EC9B0" },
    { tag: t.tagName, color: "#569cd6" },
    { tag: t.attributeName, color: "#9CDCFE" },
]);

export const customLightHighlightStyle = HighlightStyle.define([
    { tag: t.keyword, color: "#AF00DB" },
    { tag: t.string, color: "#A31515" },
    { tag: t.comment, color: "#008000" },
    { tag: t.variableName, color: "#001080" },
    { tag: t.tagName, color: "#800000" },
    { tag: t.attributeName, color: "#FF0000" },
]);

// --- Custom Themes (Ported from Reference) ---

export const customLightTheme = EditorView.theme({
    "&": {
        backgroundColor: "#FFFFFF",
        color: "#333333",
        caretColor: "#000000"
    },
    ".cm-cursor": {
        borderLeftColor: "#000000"
    },
    // Selection
    ".cm-selectionBackground, ::selection": {
        backgroundColor: "#ADD6FF80 !important"
    },
    "&.cm-focused .cm-selectionBackground": {
        backgroundColor: "#ADD6FF80 !important"
    },
    // Gutters
    ".cm-gutters": {
        backgroundColor: "#F5F5F5",
        color: "#999",
        borderRight: "1px solid #DDD"
    },
    ".cm-activeLineGutter": {
        backgroundColor: "#E6F3FF",
        color: "#333"
    },
    ".cm-activeLine": {
        backgroundColor: "transparent",
        outline: "1px solid #E6F3FF" // Use outline instead of background
    },
    // Scrollbar Colors
    "& ::-webkit-scrollbar-thumb": {
        backgroundColor: "#C1C1C1"
    },
    "& ::-webkit-scrollbar-thumb:hover": {
        backgroundColor: "#A8A8A8"
    },
    // Search Match
    ".cm-searchMatch": {
        backgroundColor: "#515c6a",
        border: "1px solid #c8c8c880",
        zIndex: "100" // Attempt to stack above others
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: "#ea5c00 !important",
        border: "1px solid #ffffff !important",
        zIndex: "101"
    }
}, { dark: false });

export const customDarkTheme = EditorView.theme({
    "&": {
        backgroundColor: "#1E1E1E",
        color: "#CCCCCC",
        caretColor: "#FFFFFF"
    },
    ".cm-cursor": {
        borderLeftColor: "#FFFFFF"
    },
    // Selection
    ".cm-selectionBackground, ::selection": {
        backgroundColor: "#264F7880 !important" // Add 50% opacity
    },
    "&.cm-focused .cm-selectionBackground": {
        backgroundColor: "#264F7880 !important"
    },
    // Gutters
    ".cm-gutters": {
        backgroundColor: "#1E1E1E",
        color: "#858585",
        border: "none"
    },
    ".cm-activeLineGutter": {
        backgroundColor: "#282828",
        color: "#C6C6C6"
    },
    ".cm-activeLine": {
        backgroundColor: "transparent",
        outline: "1px solid #282828"
    },
    // Scrollbar Colors
    "& ::-webkit-scrollbar-thumb": {
        backgroundColor: "#424242"
    },
    "& ::-webkit-scrollbar-thumb:hover": {
        backgroundColor: "#4F4F4F"
    },
    // Search Match
    ".cm-searchMatch": {
        backgroundColor: "#515c6a",
        border: "1px solid #c8c8c880",
        zIndex: "100"
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: "#ea5c00 !important",
        border: "1px solid #ffffff !important",
        zIndex: "101"
    },
    // Fold Placeholder
    ".cm-foldPlaceholder": {
        backgroundColor: "#2c2c2c",
        border: "1px solid #444444",
        color: "#CCCCCC",
        padding: "0 2px",
        borderRadius: "2px",
        cursor: "pointer"
    },
    "[title='unfold']": {
        color: "#CCCCCC",
        cursor: "pointer"
    },
    "[title='fold']": {
        color: "#CCCCCC",
        cursor: "pointer"
    }
}, { dark: true });

/**
 * Get theme extension pair.
 * @param {boolean} isDark 
 */
export function getThemeExtension(isDark) {
    if (isDark) {
        return {
            theme: customDarkTheme,
            highlight: syntaxHighlighting(customDarkHighlightStyle)
        };
    } else {
        return {
            theme: customLightTheme,
            highlight: syntaxHighlighting(customLightHighlightStyle)
        };
    }
}
