const jwt = require('koa-jwt');
// 用户路由
const Router = require('koa-router');
// 前缀写法
const router = new Router({prefix: '/users'});
const { find,findById,create,update, delete: del, 
        login, checkOwner, updatePassword,
        listArticles,
        listFollowing, listFollowers, 
        checkUserExist, follow, unfollow,
        listLikingArticles, likeArticle, unlikeArticle,
        listCollectingArticles, collectArticle, uncollectArticle,
} = require('../controllers/users');

const { checkArticleExist } = require('../controllers/articles')

const { secret } = require('../config');

// 认证中间件
const auth = jwt({ secret });

// 编写认证中间件===============================
// const auth = async (ctx, next) => {
//     // header 把请求头都改变为小写，当没有 token 请求头，则默认为空，反正报错
//     const { authorization = '' } = ctx.request.header;
//     // { Authorization: Bearer token}
//     const token = authorization.replace('Bearer ','');
//     try{
//         // 报错：token 被篡改或者为空，属于 401 错误：未认证错误。
//         const user = jsonwebtoken.verify(token, secret);
//         // 用于存储用户信息
//         ctx.state.user =  user;
//     }catch(err){
//         ctx.throw(401, err.message);
//     }
//     // 执行后续中间件
//     await next();
// }


// 1、获取用户列表
router.get('/', find);
// 2、新建用户
router.post('/', create);
// 3、获取用户
router.get('/:id', findById);
// 4、修改用户，需认证（auth）—> 授权（checkOwner）
router.patch('/:id', auth, checkOwner,update);
// 5、删除用户，需认证（auth）—> 授权（checkOwner）
router.delete('/:id', auth, checkOwner, del);
// 6、用户登录
router.post('/login',login);
router.patch('/:id/password', auth, checkOwner,updatePassword);

// 用户文章列表
router.get('/:id/articles', listArticles);

// 7、用户关注者列表，嵌套关系
router.get('/:id/following', listFollowing);
// 8、用户粉丝列表，嵌套关系
router.get('/:id/followers', listFollowers);
// 9、关注用户
router.put('/following/:id', auth, checkUserExist, follow);
// 10、取关用户
router.delete('/following/:id', auth, checkUserExist, unfollow);

// 赞  两者互斥，作为中间件时，需要执行 next
router.get('/:id/likingArticles', listLikingArticles);
router.put('/likingArticles/:id', auth, checkArticleExist, likeArticle);
router.delete('/likingArticles/:id', auth, checkArticleExist, unlikeArticle);

// 收藏文章
router.get('/:id/collectingArticles', listCollectingArticles);
router.put('/collectingArticles/:id', auth, checkArticleExist,  collectArticle);
router.delete('/collectingArticles/:id', auth, uncollectArticle);

module.exports = router;