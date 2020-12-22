const mongoose = require('mongoose');
const Comment = mongoose.model('Comment',new mongoose.Schema({
    //当前评论属于的文章id
    aid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    },
    //评论由哪个用户发布
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    //评论发布时间
    time: {
        type: Date
    },
    //评论内容
    content: {
        type: String
    }
}));

module.exports = {
    Comment: Comment
};