// index.js
const { PROVINCES } = require('./provinces')
exports.main = async (event, context) => {
    console.log('云函数执行')
    console.log(PROVINCES)
    // 返回省份数据
    return {
        provinces: PROVINCES
    }
}