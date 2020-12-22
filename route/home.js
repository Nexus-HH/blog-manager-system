//博客展示页面
//引入express模块
const express = require('express');
//导入文章集合的构造函数
const {Article} = require('../model/article');
//引入mongoose-sex-page模块
const pagination = require('mongoose-sex-page');
//导入评论集合构造函数
const {Comment} = require('../model/comment');

//创建博客展示页面的路由
const home = express.Router();

//博客首页
home.get('/', async(req,res) => {
    let page = req.query.page;
    //联合查询
    let result = await pagination(Article).page(page).size(1).display(3).find({}).populate('author').exec();
    // console.log(result);
    // return;
    res.render('home/default.art',{
        result: result
    });
});
//文章详情页面
home.get('/article', async(req,res) => {
    let id = req.query.id;
    //根据id查询文章信息
    let article = await Article.findOne({_id: id}).populate('author');
    //查询当前文章的评论
    let comments = await Comment.find({aid: id}).populate('uid');
    res.render('home/article.art',{
        article: article,
        comments: comments
    });
});

//创建评论功能路由
home.post('/comment',async(req,res)=>{
    const{aid,uid,content} = req.body;
    //将评论信息存储到评论集合中
    await Comment.create({
        content: content,
        aid: aid,
        uid: uid,
        time: new Date()
    });
    res.redirect('/home/article?id=' + aid);
});


//实现退出登录功能
home.get('/logout', (req, res) => {
    //console.log(123);
	// 删除session
	req.session.destroy(function () {
		// 删除cookie
		res.clearCookie('connect.sid');
		// 重定向到用户登录页面
		res.redirect('/admin/login');
		// 清除模板中的用户信息
		req.app.locals.userInfo = null;
	});
});

module.exports = home;
