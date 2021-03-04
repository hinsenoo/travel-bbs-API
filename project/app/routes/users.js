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
} = require('../controllers/users');

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

// // 7、用户关注者列表，嵌套关系
// router.get('/:id/following', listFollowing);
// // 8、用户粉丝列表，嵌套关系
// router.get('/:id/followers', listFollowers);
// // 9、关注用户
// router.put('/following/:id', auth, checkUserExist, follow);
// // 10、取关用户
// router.delete('/following/:id', auth, checkUserExist, unfollow);
// // 11、用户关注者列表，嵌套关系
// router.get('/:id/followingTopics', listFollowingTopics);
// // 12、关注话题
// router.put('/followingTopics/:id', auth, checkTopicExist, followTopic);
// // 13、取关话题
// router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic);
// // 14、问题列表
// router.get('/:id/questions', listQuestions);

// // 赞  两者互斥，作为中间件时，需要执行 next
// router.get('/:id/likingAnswers', listLikingAnswers);
// router.put('/likingAnswers/:id', auth, checkAnswerExist, likeAnswer, undislikeAnswer);
// router.delete('/likingAnswers/:id', auth, checkAnswerExist, unlikeAnswer);
// // 踩
// router.get('/:id/dislikingAnswers', listDislikingAnswers);
// router.put('/dislikingAnswers/:id', auth, checkAnswerExist,  dislikeAnswer, unlikeAnswer);
// router.delete('/dislikingAnswers/:id', auth, checkAnswerExist, undislikeAnswer);
// // 收藏答案
// router.get('/:id/collectingAnswers', listCollectingAnswers);
// router.put('/collectingAnswers/:id', auth, checkAnswerExist,  collectAnswer);
// router.delete('/collectingAnswers/:id', auth, uncollectAnswer);

module.exports = router;