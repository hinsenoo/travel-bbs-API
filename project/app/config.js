module.exports = {
    secret: `${process.env.TOKEN_SECRET}`, // token 密钥
    connectionStr: `mongodb://admin:${process.env.DB_PASS}@hinsenoo.top:27017/travel-bbs-API?retryWrites=true&w=majority`,
}