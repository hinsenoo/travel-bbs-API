// ES6 类写法
const path = require('path');
class HomeCtl {
    index(ctx) {
        ctx.body = '这是主页';
    }
    upload(ctx) {
        const file = ctx.request.files.file;
        // 生成图片链接
        const basename = path.basename(file.path);
        ctx.body = { 
            status: 0,
            url: `${ctx.origin}/uploads/${basename}` 
        };
    }
}

// 实例化类并导出
module.exports = new HomeCtl();