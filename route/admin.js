//用户管理页面
//引入express模块
const express = require('express');
//导入用户集合构造函数
const {User} = require('../model/user');
//导入文章集合构造函数
const {Article} = require('../model/article');
//引入bcrypt模块
const bcrypt = require('bcrypt');
//引入formidable模块
const formidable = require('formidable');
//导入mongoose-sex-page模块
const pagination = require('mongoose-sex-page');
//导入joi模块
const Joi = require('joi');
//引入path模块
const path = require('path');

//创建用户管理页面的路由
const admin = express.Router();

//渲染登录页面
admin.get('/login', (req,res) => {
    res.render('admin/login');
});
admin.get('/', (req,res) => {
    res.render('admin/login');
});

//实现登录功能
admin.post('/login',async (req,res) => {
    //接收post请求参数
    //二次验证邮箱和密码，因为用户可能禁用JavaScript代码
    const {email,password} = req.body;
    // 如果用户没有输入邮件地址或密码的话
    if (email == '' || email.trim().length == 0 || password == '' || password.trim().length == 0) {
        return res.status(400).render('admin/error',{msg: '邮件地址或密码错误'});
    }
    //根据邮箱地址查询数据库
    let user = await User.findOne({email: email});
    if(user){
        //密码比对成功
        if(await bcrypt.compare(password,user.password)){
            //将用户名储存在session对象中
            req.session.username = user.username;
            //将用户角色存储在session对象中
            req.session.role = user.role;
            //由于用户信息需要显示在许多页面的相同部分，所以把它添加到app.locals对象中
            req.app.locals.userInfo = user;
            //需要对用户角色进行判断
            if(user.role == 'admin'){
                //重定向
                res.redirect("/admin/user");
            }
            else{
                //重定向
                res.redirect("/home/");
            }
        }else{
            res.status(400).render('admin/error',{msg: '邮件地址或密码错误'});
        }
    }else{
        res.status(400).render('admin/error',{msg: '邮件地址或密码错误'});
    }
});

//实现退出登录功能
admin.get('/logout', (req, res) => {
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

//请求用户页面时做出响应
admin.get('/user',async (req,res) => {
    //表示，标记当前页面
    req.app.locals.currentLink = 'user';

    //接收客户端传递过来的当前页参数
    let page = req.query.page || 1;
    //每一页显示多少条数据
    let pageSize = 2;
    //查询用户总数
    let count = await User.countDocuments({});
    //总页数
    let total = Math.ceil(count / pageSize);
    let start = (page -1) * pageSize; 
    //将用户信息从数据库中导出
    let users = await User.find({}).limit(pageSize).skip(start);
    res.render('admin/user',{
        users: users,
        page: page,
        total: total,
        count: count
    });
});


//渲染用户页面
admin.get('/user-edit',async (req,res) => {
    //表示，标记当前页面
    req.app.locals.currentLink = 'user';

    //当添加用户出错时，还是要返回到当前页面，并把错误信息显示出来
    const {message,id} = req.query;
    if(id){
        //修改操作
        let user = await User.findOne({_id: id});
        res.render('admin/user-edit',{
            message: message,
            user: user,
            link: '/admin/user-modify?id='+id,
            button: '修改'
        });
    }else{
        //添加操作
        res.render('admin/user-edit',{
            message: message,
            link: '/admin/user-edit',
            button: '添加'
        });
    }
});

//添加用户功能路由
admin.post('/user-edit',async (req,res,next) => {
    const schema = Joi.object({
        username: Joi.string().min(2).max(20).required().error(new Error('用户名输入错误')),
        email: Joi.string().email().required().error(new Error('邮箱格式错误')),
        password: Joi.string().regex(/^[a-zA-Z0-9_]{6,16}$/).required().error(new Error('密码格式错误')),
        role: Joi.string().valid('normal','admin').required().error(new Error('用户身份不合规范')),
        state: Joi.number().valid(0,1).required().error(new Error('用户状态不合规范'))
    });
    //验证
    try{
        //console.log(req.body);
        await schema.validateAsync(req.body);
        //console.log(1234);
    }catch(err){
        //验证不通过直接重定向到添加用户页面
        return next(JSON.stringify({path: '/admin/user-edit', message: err.massage}));
    }
    //验证通过还需要对邮箱再次验证，这次是看数据库中有没有同名邮箱地址
    let user = await User.findOne({email: req.body.email});
    if(user){
        //邮箱被占用了
        //验证不通过直接重定向到添加用户页面
        return next(JSON.stringify({path: '/admin/user-edit', message: '该邮箱已经被注册了'}));
    }
    else{
        //邮箱没问题，就可以对密码进行加密了
        let salt = await bcrypt.genSalt(10);
        let password = await bcrypt.hash(req.body.password,salt);
        //加密后的密码需要替换原来的req.body.password
        req.body.password = password;
        //将用户添加到数据库中
        await User.create(req.body);
        //重定向
        res.redirect('/admin/user');
    }

});
admin.post('/user-modify',async(req,res,next)=>{
    const {username, email, role, state, password} = req.body;
    const id = req.query.id;
    //根据id查询用户，从而来比对密码
    let user = await User.findOne({_id: id});
    //比对密码
    let isValid = await bcrypt.compare(password, user.password);
    if(isValid){
        //更新用户信息
        await User.updateOne({_id: id},{
            username: username,
            email: email,
            role: role,
            state: state
        });
        res.redirect('/admin/user');
    }
    else{
        let obj = {path: '/admin/user-edit', message: '密码输入错误，不能修改用户信息', id: id};
        next(JSON.stringify(obj));
    }
});
//删除用户功能路由
admin.get('/delete',async(req,res)=>{
    //获取要删除的用户id然后删除
    await User.findOneAndDelete({_id: req.query.id});
    res.redirect('/admin/user');
});
//文章列表页面路由
admin.get('/article',async(req,res)=>{
    // 接收客户端传递过来的页码
	const page = req.query.page;
	// 标识 标识当前访问的是文章管理页面
	req.app.locals.currentLink = 'article';
	// page 指定当前页
	// size 指定每页显示的数据条数
	// display 指定客户端要显示的页码数量
	// exec 向数据库中发送查询请求
	// 查询所有文章数据
	let articles = await pagination(Article).find().page(page).size(1).display(3).populate('author').exec();

	// res.send(articles);

	// 渲染文章列表页面模板
	res.render('admin/article.art', {
        articles: articles,
        total: articles.total
	});
});
//文章编辑页面路由
admin.get('/article-edit',async(req,res)=>{
    //表示，标记当前页面
    req.app.locals.currentLink = 'article';
    res.render('admin/article-edit.art');
});
//实现文章添加功能的路由
admin.post('/article-add', (req,res)=>{
    //创建表单解析对象
    const form = new formidable.IncomingForm();
    //配置上传文件的存放位置
    form.uploadDir = path.join(__dirname, '../','public','uploads');
    //保留上传文件的后缀，默认不保留
    form.keepExtensions = true;
    //解析表单
    form.parse(req,async(err,fields,files)=>{
        await Article.create({
            title: fields.title,
            author: fields.author,
            publishDate: fields.publishDate,
            cover: files.cover.path.split('public')[1],
            content: fields.content
        });
        res.redirect('/admin/article');
    });
});
module.exports = admin;