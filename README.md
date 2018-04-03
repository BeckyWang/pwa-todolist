# pwa-todolist
一个pwa应用，简单的获取todo list，可离线使用，添加到桌面

## 使用方法
<p>依赖：node</p>
1. 克隆仓库：`git clone https://github.com/BeckyWang/pwa-todolist.git`
2. 安装依赖：`npm install `可使用淘宝镜像cnpm
3. 本地测试：`npm run server` 启动node的http服务器。
4. 浏览器访问localhost:8000/html/list.html，即可看到效果。
5. 点击应用的刷新按钮，获取最新数据。

## 离线访问
打开浏览器控制台，设置离线状态，再刷新浏览器，还可以看到数据~

## 添加到桌面
<p>打开浏览器控制台，application -> manifest -> Add to homescreen</p>
<p>桌面出现快捷方式，可直接点开，像访问桌面应用一样~</p>
