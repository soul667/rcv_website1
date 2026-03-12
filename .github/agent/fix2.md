优化 RCV Website 的 Research 页面、Team 成员详情页及 Home 页面的交互与设计
## 1. Team 成员页面优化
- **路由与跳转优化**:
  - 为不同成员的子页面实现路由导航（例如：`localhost:5173/team/:slug`）。
  - 确保在 `ResearchPage` 的 "Related Lab Members" 列表点击成员名字后，能直接跳转到对应的个人详情页。
  - *参考文件*: `src/components/pages/TeamPage.tsx`, `src/components/Router.tsx`