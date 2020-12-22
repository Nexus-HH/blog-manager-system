// 导入joi模块
const joi = require('joi')

// 定义验证规则
const schema = joi.object({
  // username必须是字符串类型、最小长度是2、最大长度是6、必填项、自定义验证失败错误信息
  username: joi.string().min(2).max(6).required().error(new Error('用户名格式不正确')),
  // email必须是字符串类型、必须符合邮箱格式、必填项、自定义验证失败错误信息
  email: joi.string().email().required().error(new Error('邮箱格式不正确')),
  // pwd必须是字符串类型、必须符合指定的正则规则、自定义验证失败错误信息
  pwd: joi.string().regex(/^[a-zA-Z0-9]+$/).error(new Error('密码格式不正确')),
  // sex必须是数字类型、值是0或1、必填项、自定义验证失败错误信息
  sex:joi.number().valid(0,1).required().error(new Error('性别格式不正确'))
});
// 要验证的对象
const user = {
  username: 'admin',
  email: 'admin@qq.com',
  pwd: 'abc123',
  sex:0
}
// validate方法验证user是否符合规则
schema.validateAsync(user).then((val) => {
  console.log(val)
  console.log('验证通过')
}).catch((err) => {
  console.log(err)
})