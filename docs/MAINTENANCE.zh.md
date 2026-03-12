# RCV 实验室网站维护指南（中文）

本站为 React + Vite 的单页静态站点，内容全部位于 `public/` 并在运行时通过 `fetch` 读取，无需服务器或数据库。

## 运行项目
- 安装依赖：`npm install`
- 启动开发：`npm run dev`（因为 `base` 为 `/rcv_website/`，请打开 http://localhost:5173/rcv_website/）
- 构建：`npm run build`

## 成员数据存放位置
- 个人档案：`public/content/authors/<Name_Id>/_index.md`
- 头像：`public/content/authors/<Name_Id>/avatar.png`（默认头像：`public/assets/media/authors_research/default_avatar.png`）
- 团队分组配置：`public/content/people_page/people.md`
- 前端读取的作者索引：`public/assets/data/authors.json`（由脚本生成）

`_index.md` 前置字段需包含 `title`、`role`、`user_groups`（如 `Ph.D. Students`、`M.Sc. Students`、`Undergraduate Students`），`weight` 控制排序（数字越小越靠前）。正文使用 `### About Me`、`### Research`、`### Publications` 结构。

## 添加成员（推荐流程）
1. 在 `scripts/test-members-data.json` 中加入成员数据（或另建 JSON）。
2. 运行 `npm run members:add-test` 生成目录、复制头像占位并刷新 `authors.json`。
3. 如有真实头像，替换生成目录中的 `avatar.png`。
4. 若手动编辑 Markdown，完成后运行 `npm run members:sync-index` 以更新 `public/assets/data/authors.json`。

## 删除临时测试成员
- 运行 `npm run members:remove-test` 删除生成的测试档案并重建 `authors.json`。

## 首页首图（Hero）图片与文案
- 图片：`public/assets/media/home_slides/`。运行 `npm run hero:slides` 可输出一段可直接粘贴的 `slides` 配置（用于 `src/utils/config.ts` 中的 `defaultHeroConfig` 或团队轮播）。
- 文案：`src/components/LanguageContext.tsx` 内的 `hero.title`、`hero.subtitle`、`hero.description1/2`（需同时维护中英两份）。
- 配置：`src/utils/config.ts` 中的 `defaultHeroConfig` 和 `defaultTeamCarouselConfig` 可替换 `slides`、`autoPlay`、`slideDuration` 等。

## 论文（Publications）维护
- 数据源：每篇论文一个文件夹 `public/content/publication/<slug>/index.yaml`。
- 快速导入：准备 JSON（参考 `scripts/sample-publication.json`）后执行 `npm run publications:add -- ./your.json`。脚本会：
  - 生成/更新 `index.yaml`
  - 根据 `type` 映射到 `publication_types`（会议=1，期刊=2，预印本=3）
  - 刷新前端索引 `public/assets/data/publications.json`
- 若手动添加文件夹：运行 `npm run publications:sync` 重建索引。
- 校验：`npm run test:publications` 确认索引与目录一致。

## 研究方向（Research）维护
- 每个方向位于 `public/content/research/<folder>/index.toml`，包含 `[meta]`、`[description]`、`[[keywords]]`、`[[members]]`。
- `meta.image` 支持：
  - `/content/research/<folder>/...` 的绝对路径（推荐），或
  - 同目录下的文件名。
- 快速导入：按 `scripts/sample-research-area.json` 模板填写 JSON，执行 `npm run research:add -- ./area.json`。可选字段 `image_src` 会复制图片到目标目录并自动写入正确路径。
- 排序：使用 `meta.weight`（数值越小越靠前）。

## 校验与构建
- 成员校验：`npm run test:members`
- 论文校验：`npm run test:publications`
- 综合校验：`npm run test:content`
- 构建：`npm run build`

## 常见问题
- 成员未展示：检查文件夹名与 `authors.json` 是否一致、`user_groups` 是否填写，并运行 `npm run members:sync-index`。
- 头像缺失：确认成员目录下有 `avatar.png`，否则会回退到默认头像。
- 部署路径错误：使用 `getAssetUrl`/`getContentUrl` 构造路径，避免硬编码。

## 本次添加的工具
- 成员：`npm run members:add-test`、`npm run members:remove-test`、`npm run members:sync-index`
- 论文：`npm run publications:add -- ./your.json`、`npm run publications:sync`
- 研究：`npm run research:add -- ./your.json`
- 首图：`npm run hero:slides`
- 校验：`npm run test:members`、`npm run test:publications`、`npm run test:content`
