/**
 * 日志文件配置, 邮箱配置
 * zhuge 2018-12-10 13:35
 * last modify time: 2018-12-11 17:42
 * last modify name: zhuge 
 */
var path = require('path');
var config = {
  fileName: '',// <required> 日志路径
  pattern: 'YYYY-MM-DD',// <required> 日志格式
  logPath: '',//<required>日志路径
  project: '',// 当前项目名称
  env: '', // 修改当前环境 'develop' || 'test' || 'release'
  host: '',
  port: 465,
  secure: true,// true for 465, false for other ports
  user: '', // generated ethereal user
  pass: '', // generated ethereal password 
  from: '', // sender address
  to: '', // list of receivers 多个邮箱","分开
  canSend: true,//是否可以发送邮件（false：不发送；true:发送）
};

// 设置配置信息
function setConfig (options){
  config = options;
  return config;
}

// 获取配置信息
function getConfig (){
  return config;
}

module.exports = {
  getConfig: getConfig,
  setConfig: setConfig
};