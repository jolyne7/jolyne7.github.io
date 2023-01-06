import {defineUserConfig} from "vuepress";
import theme from "./theme.js";
// import { searchPlugin } from "@vuepress/plugin-search";

export default defineUserConfig({
  base: "/",
  locales: {
    "/": {
      lang: "zh-CN",
      title: "Haya的博客",
      description: "",
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
  head:[[ 'script', {}, `
     var _hmt = _hmt || [];
   (function() {
    var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?7edd9aad671aab1256cd213931de1038";
  var s = document.getElementsByTagName("script")[0];
   s.parentNode.insertBefore(hm, s); })();
     `
  ]],
});
