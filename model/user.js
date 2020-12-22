//导入mongoose模块
const mongoose = require('mongoose');
//导入bcrypt模块
const bcrypt = require('bcrypt');
//引入@hapi/joi模块
const Joi = require('joi');

const User = mongoose.model('User', new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        //保证邮箱地址不重复
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    state: {
        type: Number,
        //0 是启用状态，1 是禁用状态
        default: 0
    }
}));

// async function createUser(){
//     let salt = await bcrypt.genSalt(10);
//     let password1 = await bcrypt.hash('1admin',salt);
//     let password2 = await bcrypt.hash('2admin',salt);
//     let password3 = await bcrypt.hash('3admin',salt);
//     let password4 = await bcrypt.hash('4admin',salt);
//     let password5 = await bcrypt.hash('5admin',salt);
//     const user1 = await User.create({username: 'SuperAdmin1', email: 'admin1@qq.com', password: password1, role: 'admin', state: 0});
//     const user2 = await User.create({username: 'SuperAdmin2', email: 'admin2@qq.com', password: password2, role: 'admin', state: 0});
//     const user3 = await User.create({username: 'SuperAdmin3', email: 'admin3@qq.com', password: password3, role: 'admin', state: 0});
//     const user4 = await User.create({username: 'SuperAdmin4', email: 'admin4@qq.com', password: password4, role: 'admin', state: 0});
//     const user5 = await User.create({username: 'SuperAdmin5', email: 'admin5@qq.com', password: password5, role: 'admin', state: 0});
//     //console.log(user);
// }
// createUser();

//验证用户信息
// const validateUser = async(user) =>{
//     //定义对象的验证规则
//     const schema = Joi.object({
//         username: Joi.string().min(2).max(20).required().error(new Error('用户名输入错误')),
//         email: Joi.string().email().required().error(new Error('邮箱格式错误')),
//         password: Joi.string().regex(/^[a-zA-Z0-9_]{6,16}$/).required().error(new Error('密码格式错误')),
//         role: Joi.string().valid('normal','admin').required().error(new Error('用户身份不合规范')),
//         state: Joi.number().valid(0,1).required().error(new Error('用户状态不合规范'))
//     });
//     return await schema.validateAsync(user);
// }

module.exports = {
    User: User,
    //validateUser: validateUser
};