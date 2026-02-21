# PureEditor 核心架构 v2.0 (草案)

本文档概述了 `PureEditor-Core-Meta` 的架构路线图，专为支持 HPTE 宿主应用的 **响应式多标签 IDE** 目标而设计。

## 1. 多标签架构：虚拟多文档系统

为了在移动设备上实现桌面级性能，同时避免多个 WebView 实例带来的巨大内存开销，我们将通过单个 CodeMirror 实例实现 **虚拟多文档系统**。

### 1.1 核心概念
- **单一视图 (Single View)**: DOM 中仅存在一个 `EditorView` (DOM 节点)。
- **多重状态 (Multiple States)**: 核心层管理一个 `EditorState` 对象映射表，每个对象对应一个“打开”的文件/标签页。
- **会话切换 (Session Switching)**: 当用户在宿主层 (ArkTS) 切换标签页时，核心层只需替换 `EditorView` 的 `state`。这种方式是瞬时的，并且能保留每个文件的历史记录/撤销栈。

### 1.2 会话生命周期 (提案)
1.  **打开 (Open)**: 宿主发送文件内容。核心层创建 `EditorState`，如果是后台标签页则不一定挂载。
2.  **激活 (Activate)**: 宿主请求显示某个 URI。核心层调用 `view.setState(session.state)`。
3.  **编辑 (Edit)**: 用户输入。变更仅应用于 *当前激活* 的状态。
4.  **后台 (Background)**: 用户切换走。状态保留在内存中。
5.  **关闭 (Close)**: 宿主请求关闭。核心层销毁 `EditorState` 以释放内存。

---

## 2. 桥接标准化

ArkTS (宿主) 与 WebView (核心) 之间的通信将被标准化为两个严格定义的接口。

### 2.1 传入接口: `window.editorApi` (宿主 -> 核心)
宿主调用此接口来控制编辑器。

**待实现 API (第一阶段 - 补齐功能):**
- `undo()` / `redo()`: 历史记录导航。
- `setBodyPadding(bottom: number)`: 调整布局以避让虚拟键盘/工具栏。
- `insertText(text)`: 用于工具栏操作。
- `moveCursor(direction)`: 用于工具栏光标移动操作。

**会话 API (第二阶段 - 多标签):**
- `openSession(uri, content, lang)`
- `activateSession(uri)`
- `closeSession(uri)`

### 2.2 传出接口: `window.editorHost` (核心 -> 宿主)
核心调用此接口通知宿主。这将替代旧的 `editorProxy`。

**事件:**
- `onEditorReady()`: 核心加载完毕。
- `onContentChange(isDirty)`: 文档已修改。
- `onHistoryStateChange(canUndo, canRedo)`: 历史栈更新。
- `onViewUpdate(stats)`: 光标移动 / 滚动 (节流)。

**命令分发 (快捷键):**
我们不再使用 `triggerNewFile()` 这种硬编码方式，而是使用通用的分发器以提高扩展性：
- `dispatchCommand(commandId: string)`
  - `file.save` (保存)
  - `file.new` (新建)
  - `view.toggleSidebar` (切换侧边栏)
  - ...

---

## 3. 实施计划

### 步骤 1: 功能对齐 (当前优先级)
将旧核心中缺失的方法实现到新的 `EditorApi` 结构中：
- [ ] `undo`, `redo`
- [ ] `setBodyPadding`
- [ ] `insertText`, `moveCursor`
- [ ] 快捷键分发器 (Ctrl+S 等)
- [ ] 挂载 `editorHost` 事件。

### 步骤 2: 会话管理器 (下一步)
- [ ] 创建 `SessionManager` 类。
- [ ] 将 `EditorState` 的创建逻辑从 `main.js` 提取到 `SessionManager` 中。
