const mongoose = require('mongoose');

const { Schema, model } = mongoose;

// 生成文档 Schema，定义一个模式
const articlesSchema = new Schema({
    __v: { type: Number, select: false },
    writer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    titleImgUrl: { type: String, required: true },
    category: { type: String, required: true },
    place: { type: String, required: false },
    articleHTML: { type: String, required: true },
    pageViews: { type: Number, required: true, default: 0 }, // 阅读量
    likeCount: { type: Number, required: true, default: 0 }, // 投票数
    // topics: {
    //     type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    //     select: false,
    // }
}, { timestamps: true });

// 使用模式“编译”模型
module.exports = model('Article', articlesSchema);