const Article = require('../models/articles');
const Comment = require('../models/comments'); 


class ArticleCtl {
    async find(ctx) {
        // 若无指定数量，默认 perPage 为 10
        let { per_page = 10, sort = 'pageViews', desc = -1 } = ctx.query;
        // 确保最低为 0，防止传入 -1 0
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        // 确保最低为 1，防止传入 -1 0
        const perPage = Math.max(per_page * 1, 1);
        const q = new RegExp(ctx.query.q);
        // 数据检验
        desc = Number.isNaN(Number(desc)) ? 1 : desc; 
        // $or 匹配任意一项都能命中，匹配标题或者描述
        const article = await Article
            .find({ $or: [ { title: q }, { description: q } ] }).sort({ [sort]: desc }).populate('writer')
            .limit(perPage).skip(page * perPage);
        let newData = [];
        article.forEach(async item => {
            const comment = await Comment
            .find({ articleId: item._id});
            // console.log(comment.length);
            item.commentCount = comment.length;
            let newItem = JSON.parse(JSON.stringify(item));
            newItem.commentCount = comment.length;
            newData.push(newItem);
        })

        ctx.body = {
            status: 0,
            data: article
        }
    }
    // 检查文章是否存在 中间件
    async checkArticleExist(ctx, next) {
        const article = await Article.findById(ctx.params.id);
        if (!article) { ctx.throw(404, '文章不存在'); }
        // 存储问题，减少重复查询
        ctx.state.article = article;
        // 执行后续中间件
        await next();
    }
    async findById(ctx) {
        // 默认值为空字符串
        const { fields = '', type = '' } = ctx.query;
        // console.log(ctx.state.user);
        // const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        if(type === '') await Article.findByIdAndUpdate(ctx.params.id, { $inc: { pageViews: 1 }});
        // const oldArticle = await Article.findByIdAndUpdate(ctx.params.id, { $inc: { pageViews: 1 }});
        const article = await Article.findById(ctx.params.id).populate('writer');
        // let article = JSON.parse(JSON.stringify(oldArticle));
        // article.pageViews += 1;
        ctx.body = {
            status: 0,
            data: article,
            // first: oldArticle,
        };
    }
    async create(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: true },
            titleImgUrl: { type: 'string', required: true },
            category: { type: 'string', required: true },
            place: { type: 'string', required: false },
            articleHTML: { type: 'string', required: true },
        });
        const article = await new Article({ ...ctx.request.body, writer: ctx.state.user._id }).save();
        ctx.body = {
            status: 0,
            data: article,
        };
    }
    async checkWriter(ctx, next) {
        const { article } = ctx.state;
        if (article.writer.toString() !== ctx.state.user._id ) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }
    async update(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: true },
            titleImgUrl: { type: 'string', required: true },
            category: { type: 'string', required: true },
            place: { type: 'string', required: false },
            articleHTML: { type: 'string', required: true },
        });
        // 返回的是更新前的数据
        await ctx.state.article.updateOne(ctx.request.body);
        ctx.body = {
            status: 0,
            data: 'ok',
        };
    }
    async delete(ctx) {
        await Article.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }
}

module.exports = new ArticleCtl;