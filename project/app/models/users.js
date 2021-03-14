const mongoose = require('mongoose');

const { Schema, model } = mongoose;

// 生成文档 Schema，定义一个模式
const userSchema = new Schema({
    __v: {type: Number, select: false},
    name: { type: String, required: true },     // 登录用户名
    password: {type: String, required: true, select: false},    // 密码
    email: { type: String },    // 电子邮箱
    nick_name: { type: String},     // 昵称，默认与登录用户名一致
    // 用户头像
    avatar_url: { type: String, default: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png' },
    gender: { type: String, enum: ['male', 'famale'], default: 'male', required: true },     // 性别，enum 描述可枚举，从指定字段中返回
    headline: { type: String }, // 自我介绍
    employment: { type: String, default: '自由职业者' },       // 职业

    // // 居住地，数组
    // locations: { type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }], select: false},
    // // 行业
    // business: { type: Schema.Types.ObjectId, ref: 'Topic', select: false },
    // // 教育经历
    // educations: {
    //     type: [{
    //         school: { type: Schema.Types.ObjectId, ref: 'Topic' },
    //         major: { type: Schema.Types.ObjectId, ref: 'Topic' },
    //         diploma: { type: Number, enum: [1, 2, 3, 4, 5] },       // 学历
    //         entrance_year: { type: Number }, // 入学年份
    //         graduation_year: { type: Number }, // 毕业年份
    //     }],
    //     select: false
    // },
    // 关注列表
    following: {
        // 存储用户 id，使用 mongoose 提供的特殊类型
        // Schema.Types.ObjectId ,  
        // ref：引用的简写，将 ObjectId 与 schema 关联起来
        // 关联着 User 中的 id -> User id
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        select: false,
    },
    // // 话题关注列表
    // followingTopics: {
    //     type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    //     select: false,
    // },
    // 赞列表
    likingArticles: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
        select: false,
    },
    // // 踩列表
    // dislikingArticles: {
    //     type: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    //     select: false,
    // },
    // 收藏答案列表
    collectingArticles: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
        select: false,
    },

}, { timestamps: true });

// 创建用户模型，使用模式“编译”模型
module.exports = model('User', userSchema);