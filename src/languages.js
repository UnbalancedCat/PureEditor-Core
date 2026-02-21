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
        case 'plaintext': return []
        default:
            Logger.warn(`[Languages] Unknown language: ${langId}, falling back to plaintext`);
            return []
    }
}
