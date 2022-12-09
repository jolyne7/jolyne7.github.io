import {defineUserConfig} from "vuepress";
import theme from "./theme.js";
// import { searchPlugin } from "@vuepress/plugin-search";

export default defineUserConfig({
  base: "/",
  locales: {
    "/": {
      lang: "zh-CN",
      title: "博客演示",
      description: "vuepress-theme-hope 的博客演示",
    }
  },


  theme,

  shouldPrefetch: false,
  plugins: [
    //algolia 全文搜索：没设置爬虫的话，需删除 docsearchPlugin 区块以使用节点搜索
    // docsearchPlugin({
    //   indexName: "timpcfan.site",
    //   appId: "IMCC14844K",
    //   apiKey: "3de889bb29fc67e1f1850085871f4e3d",
    // }),
    //本地搜索：默认情况下，该插件会将页面标题和小标题作为搜索索引。
    // searchPlugin({
    //   // 你的选项
    //   hotKeys: [],
    // }),
  ],
});
