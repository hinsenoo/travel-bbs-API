// 设置环境变量
require('dotenv').config();
const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const error = require('koa-json-error');
const paramter = require('koa-parameter');
const mongoose = require('mongoose');
const path = require('path');
const app = new Koa();
const routing = require('./routes');
const { connectionStr } = require('./config');

// 连接 mongodb 
mongoose.connect(connectionStr,{ useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify: false }, ()=>console.log('MongoDB 连接成功了!'));
// 将连接与错误事件绑定（以获得连接错误的提示）
mongoose.connection.on('error', console.error);

// koa-static 静态资源管理
app.use(koaStatic(path.join(__dirname, 'public')));

// 错误处理中间件
app.use(error({
    // 在生产环境禁用错误堆栈的返回
    // 获取环境变量 process.env.NODE_ENV
    postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV  === 'production' ? rest : { stack, ...rest }
}));

// 注册请求体解析中间件——koaBody
app.use(koaBody({
    multipart: true,    // 启用文件格式
    formidable: {
        // __dirname 当前目录下
        uploadDir: path.join(__dirname, '/public/uploads'), // 文件上传路径
        keepExtensions: true,   // 保留扩展名
    }
}));

// 校验参数中间件（通常用于校验请求体)
// 传入 app 可以作为去全局方法来使用
app.use(paramter(app));
// 批量读取注册路由
routing(app);

app.listen(3002, () => console.log('程序启动在 3002 端口'));