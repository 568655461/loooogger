/**
 * 日志入口
 *
 */
var config = require('./source/config');
var outPutLog = require('./source/logger/outPutLog');
var logger = require('./source/logger');
var email = require('./source/email');

module.exports = {
  setConfig: config.setConfig,
  logger: logger,
  outPutLog: outPutLog,
  email: email.email
};