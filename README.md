# PureEditor-Core-Meta

`PureEditor-Core-Meta` 是 [PureEditor] 的下一代编辑器核心，基于 **CodeMirror 6** 构建。它专为嵌入 ArkTS/HarmonyOS WebView 而设计，通过桥接 API 与宿主应用进行无缝通信。

## 功能特性

- **现代架构**：使用 CodeMirror 6 的 State 和 View 系统进行模块化构建。
- **动态配置**：无需重新加载即可在运行时切换主题、语言、字号和只读模式。
- **高级搜索**：支持正则表达式/区分大小写的全功能搜索，包含高亮和导航功能。
- **代码缩略图 (Minimap)**：集成了代码缩略图，方便概览和快速跳转。
- **状态持久化**：支持保存和恢复光标位置、选区以及滚动条位置。
- **移动端优化**：针对虚拟键盘环境定制的光标可见性逻辑。

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
| `window.toggleMinimap(enable: boolean)` | 显示/隐藏代码缩略图。 |

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
| `window.getStats(): jsonString` | 返回 JSON 字符串 `{ lines, length, chars, words, selection }`。 |
| `window.saveViewState(): jsonString` | 返回序列化的状态 JSON (包含滚动位置 + 选区)。 |
| `window.restoreViewState(jsonString)` | 从保存的 JSON 字符串恢复编辑器状态。 |

## 开发指南

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

- `src/api/`: 核心 API 类和遗留桥接适配器。
- `src/features/`: 功能模块 (搜索, 移动端适配)。
- `src/configuration.js`: CodeMirror Compartment 配置注册表。
- `src/themes.js`: 主题定义。
- `src/languages.js`: 语言支持注册表。
