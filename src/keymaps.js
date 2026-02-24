import { keymap } from "@codemirror/view"
import { EditorHost } from "./api/host"

// 新增：用于缓存生成的快捷键扩展
let cachedHostKeymap = null;

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

    // 将生成的 keymap 赋值给缓存变量
    cachedHostKeymap = keymap.of([
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

    return cachedHostKeymap;
}

/**
 * 新增：获取缓存的快捷键扩展，供动态开启时使用
 */
export function getCachedHostKeymap() {
    return cachedHostKeymap || [];
}