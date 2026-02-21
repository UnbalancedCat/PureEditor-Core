import { keymap } from "@codemirror/view"
import { EditorHost } from "./api/host"

/**
 * Generates the keymap for Host interactions.
 * @param {EditorHost} host 
 * @returns {Extension}
 */
export function getHostKeymap(host) {
    const run = (cmd) => {
        return (view) => {
            return host.dispatchCommand(cmd);
        }
    }

    return keymap.of([
        { key: "Mod-n", run: run("file.new") },
        { key: "Mod-o", run: run("file.open") },
        { key: "Mod-s", run: run("file.save") },
        { key: "Mod-Shift-s", run: run("file.saveAs") }, // Or Mod-d if legacy matches
        { key: "Mod-d", run: run("file.saveAs") },        // Legacy mapping

        { key: "Mod-i", run: run("file.close") },         // Legacy mapping

        { key: "Mod-p", run: run("view.render") },        // Legacy mapping
        { key: "Mod-j", run: run("view.toggleSidebar") }, // Legacy mapping

        { key: "Mod-k", run: run("help.shortcuts") },
        { key: "Mod-l", run: run("view.fileManager") },
        { key: "Mod-,", run: run("view.openSettings") },
        { key: "Mod-.", run: run("view.openAbout") }
    ]);
}
