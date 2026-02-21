import { setLogLevel, setDebugMode } from "./logger"
import { setLanguage } from "./languages"
import { undo, redo, updateSearchState } from "./features"
import { setTheme } from "./themes"

export function initAPI(view) {
    // Expose view for debugging
    window.editorView = view
    window.editor = view

    // Logging API
    window.setLogLevel = setLogLevel
    window.setDebugMode = setDebugMode

    // Language API
    window.setLanguage = (lang) => setLanguage(view, lang)

    // Theme API
    window.setTheme = (themeName) => setTheme(view, themeName)

    // Feature API
    window.undo = () => undo(view)
    window.redo = () => redo(view)
    window.updateSearchState = (keyword, replaceWord, isCaseSensitive, isRegexp, isWholeWord, shouldJump) =>
        updateSearchState(view, keyword, replaceWord, isCaseSensitive, isRegexp, isWholeWord, shouldJump)
}
