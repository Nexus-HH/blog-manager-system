const mongoose = require('mongoose');
const Article = mongoose.model("Article", new mongoose.Schema({
    title: {
        type: String,
        maxlength: 20,
        minlength: 4,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    cover: {
        type: String,
        default: null
    },
    content: {
        type: String
    }
}));

module.exports = {
    Article: Article
};