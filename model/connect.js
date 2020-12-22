const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true) //加上这个
mongoose.connect('mongodb://localhost/blog',{useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{console.log('数据库连接成功');})
    .catch((err)=>{console.error(err,'数据库连接失败');});