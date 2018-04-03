const PORT = 8000;

const http = require('http');
const url = require('url');
const fs = require('fs');
const mine = require('./mine').types;
const path = require('path');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const xmlParser = require('koa-xml-body');
const Router = require('koa-router');

const app = new Koa();

const router = new Router({
    prefix: '/todos/api/v1'
});

router
    .get('/list', async cxt => {
        cxt.body = [{
            key: '111',
            title: '待办事项1',
            created: '2018-04-03T08:39:25Z',
            content: '这是待办事项1的内容'
        }, {
            key: '222',
            title: '待办事项2',
            created: '2018-04-04T08:39:25Z',
            content: '这是待办事项2的内容'
        }, {
            key: '333',
            title: '待办事项3',
            created: '2018-04-05T08:39:25Z',
            content: '这是待办事项3的内容'
        }]
    })
    .get('/todo/:todokey', async cxt => {
        let response = null;
        console.log(cxt.params.todokey);
        switch (cxt.params.todokey) {
            case '111':
                response = {
                    key: '111',
                    title: '待办事项1',
                    created: '2018-04-06T08:39:25Z',
                    content: '这是待办事项1修改过的内容'
                };
                break;
            case '222':
                response = {
                    key: '222',
                    title: '待办事项2',
                    created: '2018-04-04T08:39:25Z',
                    content: '这是待办事项2的内容'
                };
                break;
            case '333':
                response = {
                    key: '333',
                    title: '待办事项3',
                    created: '2018-04-05T08:39:25Z',
                    content: '这是待办事项3的内容'
                };
                break;
            default:
                response = {};
                break;
        }
        cxt.body = response;
    });

app
    .use(async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            // will only respond with JSON
            console.log(err);
            ctx.status = err.statusCode || err.status || 500;
            ctx.body = {
                message: err.message
            };
        }
    })
    .use(xmlParser({
        encoding: 'utf8'
    }))
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods());

http.createServer(function(request, response) {
    if (/api/.test(request.url)) {
        app.callback()(request, response);
    } else {
        var pathname = url.parse(request.url).pathname;
        var realPath = path.join("todolist-pwa", pathname);
        console.log(realPath);
        var ext = path.extname(realPath);
        ext = ext ? ext.slice(1) : 'unknown';
        fs.exists(realPath, function(exists) {
            if (!exists) {
                response.writeHead(404, {
                    'Content-Type': 'text/plain'
                });

                response.write("This request URL " + pathname + " was not found on this server.");
                response.end();
            } else {
                fs.readFile(realPath, "binary", function(err, file) {
                    if (err) {
                        response.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        response.end(err);
                    } else {
                        var contentType = mine[ext] || "text/plain";
                        response.writeHead(200, {
                            'Content-Type': contentType
                        });
                        response.write(file, "binary");
                        response.end();
                    }
                });
            }
        });
    }
}).listen(PORT);
console.log("Server running at port: " + PORT + ".");