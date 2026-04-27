# PureEditor-Core

`PureEditor-Core` 是 [PureEditor（HarmonyOS）](https://pureeditor.unbalancedcat.cn/welcome.html) 的重构版本的编辑器核心，基于 **CodeMirror 6** 构建。它专为嵌入 ArkTS/HarmonyOS WebView 而设计，通过桥接 API 与宿主应用进行无缝通信。

## 功能特性

- **现代架构**：使用 CodeMirror 6 的 State 和 View 系统进行模块化构建。
- **动态配置**：无需重新加载即可在运行时切换主题、语言、字号和只读模式。
- **高级搜索**：支持正则表达式/区分大小写的全功能搜索，包含高亮和导航功能。
- **代码缩略图 (Minimap)**：集成了代码缩略图，方便概览和快速跳转。
- **状态持久化**：支持保存和恢复光标位置、选区以及滚动条位置。
- **移动端优化**：针对虚拟键盘环境定制的光标可见性逻辑。
- **多语言支持**：通过 Wasm 运行时支持 C++、Python 等环境的语法高亮与解析。
- **智能编辑**：支持括号自动匹配 (Bracket Matching) 和智能 Tab 缩进/空格处理。

## 集成 API

以下方法挂载在 `window` 对象上，供宿主应用调用。

### 核心 IO (Core IO)

| 方法 | 描述 |
| :--- | :--- |
| `window.editorApi.setValue(text: string)` | 安全地设置编辑器内容。 |
| `window.editorApi.getValue(): string` | 获取当前编辑器内容。 |
| `window.editorApi.isReady(): boolean` | 检查编辑器视图是否已初始化。 |

### 配置 (Configuration)

| 方法 | 描述 |
| :--- | :--- |
| `window.editorApi.setTheme(isDark: boolean)` | 切换亮色/暗色主题。 |
| `window.editorApi.setLanguage(langId: string)` | 设置语言模式 (例如: 'javascript', 'python', 'json')。 |
| `window.editorApi.setFontSize(sizePx: number)` | 设置基础字号 (像素)。 |
| `window.editorApi.setReadOnly(readOnly: boolean)` | 切换只读模式。 |
| `window.editorApi.setWordWrap(enable: boolean)` | 切换自动换行。 |
| `window.editorApi.setShowLineNumbers(enable: boolean)` | 切换行号显示。 |
| `window.editorApi.setEditorConfig(enableLint, enableAutocomplete)` | 启用或禁用语法检查 (Lint) 和自动补全 (Autocomplete)。 |
| `window.toggleMinimap(enable: boolean)` | 显示/隐藏代码缩略图。 |

### 布局与编辑 (Layout & Editing)

| 方法 | 描述 |
| :--- | :--- |
| `window.refreshLayout()` | 重新计算并刷新编辑器布局。 |
| `window.editorApi.setPadding(bottom: number)` | 设置 Web 容器底部的 `padding-bottom` (配合 `box-sizing: border-box` 高度内挤压)，用于物理避让虚拟键盘和底栏。 |
| `window.undo()` | 撤销上一步操作。 |
| `window.redo()` | 重做上一步操作。 |
| `window.insertText(text: string)` | 在当前光标处插入文本。 |
| `window.insertBracket(left: string, right: string)` | 插入成对的括号 (例如: '(', ')'), 选中时会包裹选区。 |
| `window.insertTab()` | 插入 Tab 或适当的空格，处理智能缩进。 |
| `window.moveCursor(direction: string)` | 移动光标位置 ('up', 'down', 'left', 'right')。 |

### 搜索与导航 (Search & Navigation)

| 方法 | 描述 |
| :--- | :--- |
| `window.updateSearchState(keyword, replace, case, regex, wholeWord)` | 更新搜索关键词并高亮匹配项。 |
| `window.findNext()` | 跳转到下一个匹配项。 |
| `window.findPrev()` | 跳转到上一个匹配项。 |
| `window.replaceCurrent()` | 替换当前选中的匹配项。 |
| `window.replaceAll()` | 替换文档中的所有匹配项。 |
| `window.closeSearch()` | 清除搜索关键词、高亮并关闭搜索面板。 |

### 统计与状态 (Stats & State)

| 方法 | 描述 |
| :--- | :--- |
| `window.editorApi.getStats(): jsonString` | 返回 JSON 字符串 `{ lines, length, charsNoSpace, words }`。 |
| `window.editorApi.saveViewState(): jsonString` | 返回序列化的状态 JSON (包含滚动位置 + 选区)。 |
| `window.editorApi.restoreViewState(jsonString)` | 从保存的 JSON 字符串恢复编辑器状态。 |
| `window.editorApi.resetHistory()` | 重置撤销/重做堆栈历史，用于多标签页切换时隔离不同文件的修改记录。 |

### 宿主回调 (Host Callbacks)

部分操作会通过 `window.editorHost` (或兼容旧版的 `window.editorProxy`) 对象通知宿主环境 (ArkTS) 响应事件。

| 回调方法 | 描述 |
| :--- | :--- |
| `window.editorHost.onEditorReady()` | 编辑器核心加载并初始化完成后触发。 |
| `window.editorHost.onContentChange(isDirty: boolean)` | 编辑器内容发生改变时触发，返回脏状态。 |
| `window.editorHost.onHistoryStateChange(canUndo: boolean, canRedo: boolean)` | 撤销/重做堆栈状态发生变更时触发。 |
| `window.editorHost.onSearchResultChange(current: number, total: number)` | 搜索结果数量或当前高亮项改变时触发。 |
| `window.editorHost.dispatchCommand(commandId: string)` | 请求宿主执行特定的通用命令 (如: 'file.new', 'view.openSettings' 等)。 |

## 支持的语言 (Supported Languages)

PureEditor-Core 支持多种语言的语法高亮，部分语言原生支持高级的语法解析与语法检查 (Lint) 提示。

### 原生支持 (高亮)
主流开发语言均采用了 CodeMirror 6 最新的 Lezer 解析引擎，拥有完美的语法树支持，未来可无缝接入 Lint：
- **Web 基本功**: HTML, CSS, JavaScript / TypeScript, JSON
- **前端进阶**: Vue, SASS, LESS
- **主流后端**: Python, Java, C / C++, PHP, Go, Rust
- **其他**: Markdown, SQL, XML, YAML, WebAssembly (wat/wast)

### 经典支持 (仅高亮)
基于经典正则引擎 (`legacy-modes`) 移植，为以下特定领域语言提供基础的颜色高亮支持（无代码级语法检查）：
- **移动端应用开发**: Dart (Flutter), Swift (iOS), Kotlin (Android)
- **脚本与自动化**: Shell / Bash / Zsh, PowerShell, Lua, Ruby
- **硬件描述语言**: Verilog, SystemVerilog
- **容器与部署**: Dockerfile

## 开发与构建 (Development & Build)

该项目使用 Vite 打包工具构建，并集成了许可证抓取插件以满足开源合规要求。

```bash
# 安装依赖
npm install

# 运行开发服务器 (用于本地调试预览)
npm run dev

# 构建生产版本 (输出在 dist 目录下，包含 editor.bundle.js 和 THIRD_PARTY_NOTICES.txt)
npm run build
```

## 项目结构

- `src/api/`: 核心 API 类和遗留桥接适配器。
- `src/features/`: 功能模块 (搜索, 移动端适配)。
- `src/configuration.js`: CodeMirror Compartment 配置注册表。
- `src/themes.js`: 主题定义。
- `src/languages.js`: 语言支持注册表。
