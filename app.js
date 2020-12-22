//引入express模块
const express = require('express');
//引入path模块
const path = require('path');
//引入body-parser模块
const bodyParser = require('body-parser');
//引入express-session模块
const session = require('express-session');
//引入art-template模板引擎
const template = require('art-template');
//引入dateformat模块
const dateFormat = require('dateformat');
//导入Morgan模块
const morgan = require('morgan');
//导入config模块
const config = require('config');
//创建web服务器
const app = express();
//引入数据库
require('./model/connect');

if(process.env.NODE_ENV == 'development'){
    console.log('当前是开发环境');
    //app.use(morgan('dev'));
}else{
    //console.log(process.env.NODE_ENV);
    console.log('当前是生产环境');
}

//开发静态资源文件
app.use(express.static(path.join(__dirname, 'public')));

//拦截所有请求，处理post请求参数
app.use(bodyParser.urlencoded({extended: false}));
//拦截所有请求，配置session参数
app.use(session({
    resave: false, //添加 resave 选项
    //在用户没登录的情况下，不要给我保存一个未初始化的cookie
    saveUninitialized: false, //添加 saveUninitialized 选项
    secret: 'secret key',
    //设置cookie的过期时间，单位毫秒
    //cookie：{
    //  maxAge: 24*60*60*1000
    //}
}));

//告诉express模板所在位置
app.set('views',path.join(__dirname, 'views'));
//告诉express模板的默认后缀
app.set('view engine', 'art');
//告诉express处理模板所用的引擎
app.engine('art',require('express-art-template'));

//向模板内导入变量
template.defaults.imports.dateFormat = dateFormat;

//导入路由模块
const home = require('./route/home');
const admin = require('./route/admin');

//为了让没登录的用户不能访问user页面，我们需要对登录进行拦截
app.use('/admin',(req,res,next)=>{
    //如果用户访问的不是登录页面，而她又没有登录，那就重定向到登录页面
    if(req.url != '/login' && !req.session.username){
        res.redirect('/admin/login');
    }
    else{
        //如果用户是登录状态，并且只是普通用户，那就跳转到博客展示页面
        if(req.session.role == 'normal'){
            return res.redirect('/home/')
        }
        next();
    }
});

//为路由匹配请求路径
app.use('/home',home);
app.use('/admin',admin);

//错误处理中间件
app.use((err,req,res,next) => {
    let result = JSON.parse(err);
    let params = [];
    for(let attr in result){
        if(attr != 'path'){
            params.push(attr + '=' + result[attr]);
        }
    }
    res.redirect(`${result.path}?${params.join('&')}`);
});

//监听端口
app.listen(80);
console.log('web服务器启动成功');