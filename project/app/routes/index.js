// 批量读取目录下的文件，进行注册
const fs = require('fs');

module.exports = (app) => {
    // 同步读取目录
    fs.readdirSync(__dirname).forEach(file => {
        if (file === 'index.js') { return; }
        // 导入路由文件
        const route = require(`./${file}`);
        // 注册路由，并且支持响应 options 方法
        app.use(route.routes()).use(route.allowedMethods());
    })
}