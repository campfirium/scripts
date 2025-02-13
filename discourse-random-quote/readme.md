# Discourse 随机帖子金句脚本

## 简介
一个简陋但能用的 Discourse 脚本，在帖子列表顶部插入一个随机帖子金句，并提供跳转到对应帖子的链接。
该脚本由 AI 生成，仅供参考，如需优化请自行调整。

## 功能
- 在论坛帖子列表顶部随机显示一条帖子金句。
- 点击金句可以跳转到对应帖子。
- 通过手动更新 JS 文件，维护需要展示的金句。

## 安装方法
1. **编辑 Discourse 主题或组件**
   - 进入 `管理` > `自定义` > `主题`。
   - 选择一个主题或创建一个新组件。
   - 在 `自定义 CSS/HTML` 选项卡中，找到 `通用` > `head`。
   - 在 `head` 部分粘贴完整的脚本代码。

2. **修改金句数据**
   - 在脚本内找到 `_postsData` 变量。
   - 按照格式添加或修改金句：
     ```js
     // 初始化原始帖子数据（只定义一次）
     if (!window._postsData) {
       window._postsData = [
         {
           postId: "demoid1",
           title: "demotitle1",
           quotes: [
             "demoquote11",
             "demoquote12",
           ]
         },
         {
           postId: "demoid2",
           title: "demotitle2",
           quotes: [
             "demoquote21",
             "demoquote22",
           ]
         },
       ];
     }
     ```
   - `postId`：对应帖子 ID（用于跳转）。
   - `title`：帖子标题（用于显示和链接）。
   - `quotes`：该帖子的多个可选金句。

3. **保存并应用**
   - 点击 `保存`。
   - 刷新页面，随机帖子金句会出现在帖子列表顶部。



