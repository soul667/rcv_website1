# 任务：研究页面 (Research Page) 与 成员页面 (Team Page) 的优化与 Debug

## 核心任务目标
优化 RCV Website 的 Research 页面、Team 成员详情页及 Home 页面的交互与设计，提升移动端体验，并统一渲染风格。

---

## 1. Team 成员页面优化
- **路由与跳转优化**:
  - 为不同成员的子页面实现路由导航（例如：`localhost:5173/team/:slug`）。
  - 确保在 `ResearchPage` 的 "Related Lab Members" 列表点击成员名字后，能直接跳转到对应的个人详情页。
  - *参考文件*: `src/components/pages/TeamPage.tsx`, `src/components/Router.tsx`
- **移动端布局修复**:
  - 修复成员子页面正文内容在手机端无边距（Zero Margin）的问题，增加合适的左右 Padding。
  - *调试指引*: 检查 `TeamPage` 中的容器类名布局。
- **UI 清理**:
  - 在移动端，删除顶部轮播图底部过大的切换按钮。
  - *视觉目标*: 保持简洁的视觉流。

## 2. Research 页面优化
- **交互逻辑**:
  - 同 Team 部分，点击 "Related Lab Members" 实现向成员个人页面的跳转。
- **视觉一致性**:
  - **色彩统一**: 取消各板块（如 Keywords）的独立颜色标签，统一使用与主色调一致的浅灰色/毛玻璃感样式。
  - **列表优化**: 移除左侧切换导航部分的竖线指示器（Vertical Line），采用更现代的状态表示方式。
- **渲染引擎统一**:
  - 正文内容渲染必须与 `HomePage` 保持一致。
  - 使用 `ReactMarkdown`, `remark-gfm`, `rehype-raw` 进行渲染，并复用相应的 CSS Wrapper 类（如 `markdown-custom-wrapper`）。
  - *参考文件*: `src/components/HomePage.tsx` 中的渲染逻辑。
- **美化增强**:
  - 引入更现代化的设计元素（如：更细致的背景光、平滑的过渡动画、增强的毛玻璃质感）。

## 3. Home 页面优化
- **UI 减法**:
  - 移除右下角的下滑提示按钮（Selector: `#home > div.absolute.bottom-4.right-4.z-20 > button`）。
- **交互保留**:
  - 移除按钮后，必须保留鼠标滚轮下滑触发大跨度滚动的交互逻辑。

---

## 技术注意事项
- **设计风格**: 遵循 Minimalist & Premium 设计语言。
- **兼容性**: 必须同时适配 PC 端和移动端。