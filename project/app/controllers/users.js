const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/users');        // 用户模型
const Article = require('../models/articles'); // 文章模型
const { secret } = require('../config');        // 引入 token 密钥

class UsersCtl {
    // 1、获取用户列表
    async find(ctx) {
        // 若无指定数量，默认 perPage 为 10
        const { per_page = 10 } = ctx.query;
        // 确保最低为 0，防止传入 -1 0
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        // 确保最低为 1，防止传入 -1 0
        const perPage = Math.max(per_page * 1, 1)
        ctx.body = await User
            .find({ name: new RegExp(ctx.query.q) })
            .limit(perPage).skip(page * perPage);
    }
    // 2、获取指定用户信息
    async findById(ctx) {
        // 获取查询字符串种的字段
        const { fields = '' } = ctx.query;
        // split 分隔为数组  filter 过滤不存在的字段 map 对数组进行遍历 join 拼接成字符串
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        // populate 也需要动态获取，否则无法隐藏
        // const populateStr = fields.split(';').filter(f => f).map(f => {
        //     if (f === 'employments') {
        //         return 'employments.company employments.job';
        //     }
        //     if (f === 'educations') {
        //         return 'educations.school educations.major';
        //     }
        //     return f;
        // }).join(' ');
        // console.log(fields, selectFields);
        const user = await User
            .findById(ctx.params.id)
            .select('+following').populate('following');
        // const user = await User
        //     .findById(ctx.params.id)
        //     .select(selectFields)
            // .populate(populateStr);
            // user.userArticleCount = userArticleCount;
        if (!user) { ctx.throw(404, '用户不存在'); }
        const userArticles = await Article.find({ writer: ctx.params.id });
        // 粉丝列表
        const followers = await User.find({ following: ctx.params.id });
        let newUser = JSON.parse(JSON.stringify(user));
        newUser.articleCount = userArticles.length;
        newUser.followers = followers;
        ctx.body = ctx.body = { 
            status: 0,
            data: newUser,
        };
    }
    // 3、新建用户
    async create(ctx) {
        // type 数据类型 required 是否必需
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true },
        });
        const { name } = ctx.request.body;
        // 创建用户唯一性检验
        const repeatedUser = await User.findOne({ name });
        // 409，冲突
        if (repeatedUser) { ctx.throw(409, '用户已经存在'); }
        // 昵称，默认与登录用户名一致
        if(!ctx.request.body.nick_name) { 
            ctx.request.body.nick_name =  name;
        }
        const user = await new User(ctx.request.body).save();
        ctx.body = {
            status: 0,
            msg: 'ok'
        };
    }
    // 授权
    async checkOwner(ctx, next) {
        // 用户只能删除自己
        // 403 Forbidden，没有权限访问
        if (ctx.params.id !== ctx.state.user._id) {
            ctx.throw(ctx.throw(403, '没有权限'));
        }
        await next();
    }
    // 4、修改用户
    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            password: { type: 'string', required: false },
            email: { type: 'string', required: false },
            nick_name: { type: 'string', required: false },
            avatar_url: { type: 'string', required: false },
            gender: { type: 'string', required: false },
            headline: { type: 'string', required: false },
            employment: { type: 'string', required: false },
            // // itemType 表示数组中的类型，注意区别于 mongoose 的写法
            // locations: { type: 'array', itemType: 'string', required: false },
            // business: { type: 'string', required: false }, // 行业
            // employment: { type: 'array', itemType: 'object', required: false },
            // educations: { type: 'array', itemType: 'object', required: false },

        });
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        // console.log(ctx.params, user);
        if (!user) { ctx.throw(404, '用户不存在'); }
        ctx.body = {
            status: 0,
            data: await User
            .findById(ctx.params.id)
        };
    }
    // 修改密码
    async updatePassword(ctx) {
        ctx.verifyParams({
            oldPassword: { type: 'string' },
            newPassword: { type: 'string' },
        });
        console.log(ctx.request.body);

        let { oldPassword, newPassword} = ctx.request.body;
        const user = await User
            .findById(ctx.params.id).select('password');
        if (!user) { ctx.throw(404, '用户不存在'); }
        console.log(user.password);
        if(user.password !== oldPassword) {
            ctx.body = {
                status: 1,
                msg: '原密码不正确'
            };
        }else {
            await User.findByIdAndUpdate(ctx.params.id, { password: newPassword});
            ctx.body = {
                status: 0,
                data: 'ok'
            };
        }
        return;
        // const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        // // console.log(ctx.params, user);
        // ctx.body = {
        //     status: 0,
        //     data: await User
        //     .findById(ctx.params.id)
        // };
    }
    // 5、删除用户
    async delete(ctx) {
        const user = await User.findByIdAndRemove(ctx.params.id);
        if (!user) { ctx.throw(404, '用户不存在'); }
        // 删除成功，但是不返回内容
        ctx.status = 204;
    }
    // 6、登录
    async login(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        });
        // 提取账号密码
        let userInfo = { name: ctx.request.body.name, password: ctx.request.body.password }
        // 校验用户名密码
        const user = await User.findOne(userInfo);
        if (!user) { ctx.throw(401, '用户名或密码不正确'); }
        // 生成 token
        const { _id, name } = user;
        const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' });
        ctx.body = { 
            status: 0,
            token,
            data: user,
         };
    }
    // 14. 问题列表
    async listArticles(ctx) {
        const articles = await Article.find({ writer: ctx.params.id }).populate('writer');
        ctx.body = {
            status: 0,
            data: articles
        };
    }
    // 检查用户存在与否 中间件
    async checkUserExist(ctx, next) {
        const user = await User.findById(ctx.params.id);
        if (!user) { ctx.throw(404, '用户不存在'); }
        // 执行后续中间件
        await next();
    }
    // 7. 获取关注者接口
    async listFollowing(ctx) {
        // 获取关注者的具体信息，通过 populate 获取关联 Schema 的 ObjectId 的信息
        const user = await User.findById(ctx.params.id).select('+following').populate('following');
        if (!user) { ctx.throw(404, '用户不存在'); }
        ctx.body = user.following;
    }
     // 8、获取粉丝列表接口
     async listFollowers(ctx) {
        // 查询用户列表中的关注列表，包含查询用户的 id，即为用户的粉丝
        const user = await User.find({ following: ctx.params.id });
        ctx.body = user;
    }
    // 9、关注用户
    async follow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following');
        // 不可关注自己
        if (ctx.params.id == ctx.state.user._id) { 
            return; 
        }
        // 判断是否已经关注,
        // 将关注列表的 id 转为字符串（原本为 mongoose 自带的特殊类型）
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
            // 未关注
            me.following.push(ctx.params.id);
            // 保存到数据库
            me.save();
            // 成功状态，但是不返回内容
            ctx.body = {
                status: 0,
                data: 'ok',
            };
        }else {
            ctx.body = {
                status: 1,
                msg: '已关注',
            };
        }
    }
    // 10、取关用户
    async unfollow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following');
        // 获取取消关注的人在关注列表中的索引
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            // 移除指定的参数
            me.following.splice(index, 1);
            me.save();
        }
        ctx.body = {
            status: 0,
            data: 'ok',
        };
    }
}

module.exports = new UsersCtl;