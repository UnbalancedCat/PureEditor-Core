import { javascript } from "@codemirror/lang-javascript"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { json } from "@codemirror/lang-json"
import { markdown } from "@codemirror/lang-markdown"
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { cpp } from "@codemirror/lang-cpp"
import { php } from "@codemirror/lang-php"
import { go } from "@codemirror/lang-go"
import { rust } from "@codemirror/lang-rust"
import { sql } from "@codemirror/lang-sql"
import { xml } from "@codemirror/lang-xml"
import { yaml } from "@codemirror/lang-yaml"
import { vue } from "@codemirror/lang-vue"
import { sass } from "@codemirror/lang-sass"
import { less } from "@codemirror/lang-less"
import { wast } from "@codemirror/lang-wast"
import { StreamLanguage } from "@codemirror/language"
import { dart, kotlin } from "@codemirror/legacy-modes/mode/clike"
import { swift } from "@codemirror/legacy-modes/mode/swift"
import { lua } from "@codemirror/legacy-modes/mode/lua"
import { ruby } from "@codemirror/legacy-modes/mode/ruby"
import { shell } from "@codemirror/legacy-modes/mode/shell"
import { dockerFile } from "@codemirror/legacy-modes/mode/dockerfile"
import { powerShell } from "@codemirror/legacy-modes/mode/powershell"
import { verilog } from "@codemirror/legacy-modes/mode/verilog"
import { Logger } from "./logger"
// Default language extension
export const defaultLanguage = javascript()

/**
 * Get the language extension for a given ID or filename extension.
 * @param {string} langId 
 * @returns {Extension}
 */
export function getLanguageExtension(langId) {
    if (!langId) return [];

    const lower = langId.toLowerCase();

    switch (lower) {
        case 'html': return html()
        case 'css': return css()
        case 'javascript': case 'js': return javascript()
        case 'typescript': case 'ts': return javascript({ typescript: true })
        case 'json': return json()
        case 'markdown': case 'md': return markdown()
        case 'python': case 'py': return python()
        case 'java': return java()
        case 'cpp': case 'c++': case 'c': return cpp()
        case 'php': return php()
        case 'go': return go()
        case 'rust': case 'rs': return rust()
        case 'sql': return sql()
        case 'xml': return xml()
        case 'yaml': case 'yml': return yaml()
        case 'vue': return vue()
        case 'sass': case 'scss': return sass()
        case 'less': return less()
        case 'wat': case 'wast': return wast()
        case 'dart': return StreamLanguage.define(dart)
        case 'swift': return StreamLanguage.define(swift)
        case 'kotlin': case 'kt': case 'kts': return StreamLanguage.define(kotlin)
        case 'lua': return StreamLanguage.define(lua)
        case 'ruby': case 'rb': return StreamLanguage.define(ruby)
        case 'shell': case 'sh': case 'bash': case 'zsh': return StreamLanguage.define(shell)
        case 'dockerfile': return StreamLanguage.define(dockerFile)
        case 'powershell': case 'ps1': return StreamLanguage.define(powerShell)
        case 'verilog': return StreamLanguage.define(verilog)
        case 'plaintext': case 'txt': return []
        default:
            Logger.warn(`[Languages] Unknown language: ${langId}, falling back to plaintext`);
            return []
    }
}
