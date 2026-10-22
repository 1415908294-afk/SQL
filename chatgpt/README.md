# SQL Growth Lab

中文 SQL 零基础学习、真实查询执行与产品增长分析实验室。**Voca Demo 全部数据为模拟数据，不来自真实产品后台。**

## Windows 启动

安装 Node.js 22.12+，在本文件所在目录打开 PowerShell：

```powershell
npm ci
npm run dev:full
```

在浏览器打开终端 Local 地址，默认 http://127.0.0.1:5173 。已有依赖也可双击“启动学习网站.cmd”。不要直接双击 index.html。仅使用前端可运行 `npm run dev`，不影响本地SQL和本地导师。

## 功能

- 七阶段中文课程，每阶段3道主线分级练习；独立业务题库共60题，含业务背景、指标口径、提示、标准SQL和预期结果。
- SELECT / WHERE / GROUP BY / JOIN / CASE / 子查询 / 日期 / CTE / 窗口函数，以及DAU、WAU、MAU、激活、次日与7日留存、漏斗、渠道、付费率、ARPU和AI功能分析。
- Monaco编辑器、SQL格式化、真正DuckDB-Wasm执行、中文报错、结果判题、CSV导出、Recharts柱状图与趋势图。
- 六表数据字典、关联示意、确定性数据生成。120名用户、528段对话、40笔订单、678条活跃事件。
- 数据库READ_ONLY，禁外部访问与扩展，锁定配置；原生分词器防多语句，子查询解析约束安全SELECT/WITH。15秒查询超时，最多展示1000行；截断结果不判题。
- 浏览器本地进度、每日记录、错题与知识点练习覆盖、JSON备份合并导入导出。
- 学习导师：分步提示、错误辅助、已有代码逐行讲解、按错题推荐复习；默认不泄露完整标准答案。主动展开才显示答案。
- 三个分析作品集：渠道增长、cohort留存、AI功能与变现。可执行SQL、绘图、保存分析，导出Markdown或含图表的HTML报告；HTML可在浏览器打印保存PDF。

## DeepSeek 安全代理

接口已预留并实现，未配置真实密钥时明确使用本地规则辅助，不冒充AI。

1. 把 `.env.example` 复制为 `.env`。
2. 仅在 `.env` 填写 `DEEPSEEK_API_KEY`。不要使用 VITE_ 前缀，不要提交密钥。
3. `npm run dev:full` 同时启动Vite与127.0.0.1:8787后端；Vite将 `/api` 代理到后端。

`POST /api/tutor` 支持 hint/error/explain/review，包含来源检查、请求体限制、每分钟12次限流、18秒上游超时、参数校验、上游错误脱敏、完整答案显式开关。标准答案不会放入模型上下文。提示过滤是学习体验保护，不是考试级防作弊。

`npm run build` 后 `npm start` 可由Node同时服务网站和API。Node默认仅监听回环地址；如需公网部署，必须配置反向代理HTTPS、可信身份、ALLOWED_ORIGIN与持久化分布式限流。`functions/api/tutor.js` 提供Cloudflare Pages适配器。当前Sites采用静态部署，本地学习导师可用；在线DeepSeek调用需另行启用服务端代理和密钥。

## 验证与构建

```powershell
npm run verify
npm run build
node scripts/verify-assets.mjs
npm start
```

60题已在原生DuckDB1.3.2及实际DuckDB-Wasm1.3.2中验证；安全限制与导师上游模拟测试通过。没有真实DeepSeek密钥，因此未做真实模型连通测试。

之前的本地浏览器工具访问被策略阻止，未绕过。浏览器Worker/Monaco、下载、持久化与视觉仍需实际验收；不要将程序验证当作浏览器端到端通过。历史验收记录见 docs/ACCEPTANCE.md，当前接续状态见 docs/PROGRESS.md。

## 源码与部署

GitHub目标：https://github.com/1415908294-afk/SQL ，项目放在chatgpt/。

安装时从锁定依赖复制Wasm与Worker，生成模拟数据库，因此源码仓库不包含巨大的引擎二进制或数据库。标准结果JSON纳入版本管理。修改题目/生成规则后运行 `npm run data`、`npm run verify`、`npm run build`。

静态托管命令：`npm ci && npm run build`，发布dist，部署在域名根路径。生产Wasm采用约7–8MB gzip资产，浏览器DecompressionStream解压后执行；需要支持该API的现代浏览器。单线程Worker不需要COOP/COEP。浏览器首次加载编辑器和引擎后可本地执行查询，页面刷新仍需站点资源。

GitHub CI放在仓库根目录 `.github/workflows/ci.yml`，以chatgpt为工作目录。网站学习记录只在浏览器本地，不包含账号同步；标准答案在前端可见，适合自学。
