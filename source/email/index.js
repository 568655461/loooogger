/**
 * 发送 smtp 邮件
 * zhuge 2018-10-30 18:48
 * last modify time: 2018-10-31 14:48
 * last modify name: zhuge
 *
 * Node.js v6+.
 */
'use strict';
var nodemailer = require('nodemailer');
var config = require('../config');

// create reusable transporter() object using the default SMTP transport
var transporter = function () {
  return nodemailer.createTransport({
    host: config.getConfig().host,
    port: config.getConfig().port,
    secure: config.getConfig().secure,
    auth: {
      user: config.getConfig().user,
      pass: config.getConfig().pass
    }
  });
};

/**
 * 发送邮件
 * @param {String} subject 邮件标题 
 * @param {String} text 邮件内容 
 * @param {Object} attachments 附件 
 * 
 * example：
 * var mailOptions = {
        from: config.getConfig().from, // sender address
        to: config.getConfig().to, // list of receivers
        subject: 'Hello 出bug了标题', // 邮件标题
        text: 'Hello world?内容', // plain text body
        attachments: [
        {   // file on disk as an attachment
            path: '/zhugelogs/error/error_2018-10-30.log' // stream this file
        },
        {   // file on disk as an attachment
            path: '/zhugelogs/info/info_2018-10-30.log' // stream this file
        }]
    };
 */
var sendEmail = function (subject, text, attachments) {
  // 要发送的邮件内容
  var mailOptions = {
    from: config.getConfig().from,
    to: config.getConfig().to,
    subject: subject || 'node项目日志',
    text: text || 'node项目日志内容'
  };

  // 判断是否需要发送文件
  if (attachments && attachments instanceof Array) {
    mailOptions.attachments = attachments;
  }

  // send mail with defined transport object
  // 判断是否可以发送邮件
  if (config.getConfig().canSend) {
    transporter().sendMail(mailOptions, function (error, info) {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId); // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
  }
};

// 发送邮件功能
var email = function ( subject, text, attachments,callback ){

  // 要发送的邮件内容
  var mailOptions = {
    from: config.getConfig().from,
    to: config.getConfig().to,
    subject: subject || '无标题',
    text: text || ''
  };

  // 判断是否需要发送文件
  if (attachments && attachments instanceof Array) {
    mailOptions.attachments = attachments;
  }

  transporter().sendMail(mailOptions, function (error, info) {
    if (error) {
      callback(error,null);
    } else {
      callback(null,{
        info: info
      });
    } 
  });
};

module.exports = {
  sendEmail: sendEmail,
  email: email
};
