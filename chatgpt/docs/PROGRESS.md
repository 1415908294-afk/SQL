# 项目接续记录

更新时间：2026-10-22。用户要求20分钟内交付完整可运行版本。

## 当前实现

React / TypeScript / Tailwind / Monaco / DuckDB-Wasm / Recharts。七个课程阶段，每阶段3道主线练习，独立业务题库共60道。六张确定性模拟表。真实SELECT/WITH运行、只读隔离、结果判题、CSV、图表、学习记录、错题复习、本地导师与DeepSeek安全代理、三个分析作品集、Markdown和HTML图表报告导出。

## 已验证

60条标准SQL在原生DuckDB及实际Wasm中执行并与结果比较通过；只读写入拒绝、外部访问关闭、堆叠语句拒绝、字符串和注释、分组/日期/金额/窗口/留存/漏斗通过。导师代理参数校验、来源、限流、显式答案开关、上游协议、答案过滤、错误处理通过模拟上游验证。生产构建通过；gzip传输经DecompressionStream还原与原始Wasm逐字节一致。

## 需如实保留的边界

1. 尚无真实DeepSeek密钥，未调用收费模型；本地辅助可用。
2. 之前浏览器工具拒绝本地地址，未绕过。浏览器交互、下载、持久化、视觉布局需授权环境下验收。程序验证不等于浏览器测试。
3. Sites新站默认owner-private。发布结果与GitHub同步状态以最终交付和远端返回为准。
4. GitHub目标为1415908294-afk/SQL，开始时为空仓库。源码放chatgpt/；根级CI需要以chatgpt为工作目录。

## 运行

进入本目录：`npm ci`，`npm run dev:full`。仅前端：`npm run dev`。生产：`npm run build`，`npm start`。验证：`npm run verify`。
