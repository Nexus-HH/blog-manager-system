//导入bcrypt模块
const bcrypt = require('bcrypt');
//生成随机字符串
async function run(){
    let salt = await bcrypt.genSalt(10);
    let password = await bcrypt.hash('123456',salt);
    console.log(salt);
    console.log(password);
} 
run();