const jwt = require('koa-jwt');
// 用户路由
const Router = require('koa-router');
// 前缀写法
const router = new Router({prefix: '/articles/:articleId/comments'});
const { find, findById, create, update, delete: del , checkCommentExist, checkCommentator } = require('../controllers/comments');

const { secret } = require('../config');

// 认证中间件
const auth = jwt({ secret });

router.get('/', find);
router.post('/', auth, create);
// 有 id 的需检查是是否存在
router.get('/:id', checkCommentExist,findById);
router.patch('/:id', auth, checkCommentExist, checkCommentator,update);
router.delete('/:id', auth, checkCommentExist, checkCommentator, del);

module.exports = router;