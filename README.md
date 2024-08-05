## 什么是Whistle

[whistle](https://github.com/avwo/whistle)(读音[ˈwɪsəl]，拼音[wēisǒu])基于Node实现的跨平台web调试代理工具，类似的工具有Windows平台上的[Fiddler](http://www.telerik.com/fiddler/)，主要用于查看、修改HTTP、HTTPS、Websocket的请求、响应。

## 面向人群

1. 终端开发
2. 软件测试

## 背景

之前了解到Chrome下原来有一个whistle的快速切换插件可以用，但是搜了一下发现Firefox还没有，因此想要自己动手改造一个可以给Firefox使用的快速切换插件，提高工作效率。

## 功能

1. 快捷切换浏览器代理
2. 规则管理
    1. 单一规则开关
    2. 规则分组展示
3. 黑名单设置
4. 状态设置
    1. 多规则开关
    2. 切换规则后自动刷新
    3. 展示代理地址和代理端口
    4. 快捷跳转whistle管理页面
5. 状态展示
    1. 是否启用代理
    2. 启用代理规则数量

## 截图

| 规则管理 | 黑名单设置   | 状态设置 |
| ----- | --------- | ----------- |
| ![规则管理](https://i.v2ex.co/7M0JYeB0l.png)  |![黑名单设置](https://i.v2ex.co/9X5gRtgDl.png)     | ![状态设置](https://i.v2ex.co/LD372Ec5l.png)    |

## 下载地址

> 为了安全考量，直接使用Firefox的拓展商店安装即可。

[![Mozilla Add-on Version](https://img.shields.io/amo/v/whistle-switcher)](https://addons.mozilla.org/zh-CN/firefox/addon/whistle-switcher/)

## 本地构建

1. 运行 `yarn` 或者 `npm install` 安装环境依赖
2. 运行 `yarn build` 构建产物
3. 产物将会生成在项目根目录下的dist文件夹中
4. 通过Firefox的 `about:debugging` 安装`dist/manifest.json` 即可安装本地构建的addon

## 数据统计
> 更新时间: 2024年08月05日
<img width="742" alt="图片" src="https://github.com/user-attachments/assets/66a5a2eb-6552-4d3e-ac59-8b610a28c738">


## 联系方式

> 如果有使用问题，可以优先通过邮箱和Firefox评论区提交问题，正常情况下在一个工作日内就会回复。（公共假期不定期回复）

- Email：[gz7gugu@qq.com](mailto:gz7gugu@qq.com)
