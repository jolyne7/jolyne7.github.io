import {navbar} from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/",
  {text: "Java", icon: "discover", link: "/java/"},
  {text: "Golang", icon: "discover", link: "/golang/"},
  {text: "数据库", icon: "discover", link: "/db/"},
  {text: "Linux", icon: "discover", link: "/linux/"},
  {text: "数据结构算法", icon: "discover", link: "/algo/"},
  {text: "基础知识", icon: "discover", link: "/knowledge/"},
  {text: "其它", icon: "discover", link: "/other/"},
  {
    text: "数据库",
    icon: "discover",
    prefix: "/goods/",
    children: [
      {
        text: "苹果",
        icon: "edit",
        prefix: "demo1/",
        children: [
          {text: "苹果1", icon: "edit", link: "1"},
          {text: "苹果2", icon: "edit", link: "2"},
        ]
      }
    ],
  }
  // {
  //   text: "V2 文档",
  //   icon: "note",
  //   link: "https://vuepress-theme-hope.github.io/v2/zh/",
  // },
]);
