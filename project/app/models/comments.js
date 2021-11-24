const mongoose = require('mongoose');

const { Schema, model } = mongoose;

// 生成文档 Schema，定义一个模式
const commentSchema = new Schema({
    __v: { type: Number, select: false },
    content: { type: String, required: true },    // 内容
    commentator: { type: Schema.Types.ObjectId, ref: 'User', required: true, select: false },  // 评论者
    articleId: { type: String, required: true }, // 从属文章 id
    rootCommentId: { type: String }, // 评论 id
    replyTo: { type: Schema.Types.ObjectId, ref: 'User' }, // 对某人回复
}, { timestamps: true }); // 增加时间戳

// 使用模式“编译”模型
module.exports = model('Comment', commentSchema);