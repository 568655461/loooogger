# logger 日志使用方法

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]

## 主要功能

+ 日志输出到控制台；
+ 日志按照指定模板保存到指定文件，按天生成；
+ 自定义发送邮件功能

## Install

+ windows: `npm install --save zhuge-log`  
+ mac: `yarn add zhuge-log`

## Use

> 在项目中创建js,如`/logger/index.js`,内容如下

+ `logPath` 指定日志保存路径，`zhugelogs`名不需要改；
+ `project` 为当前项目名，作为日志中的字段出现在日志中；
+ `env`只有`develp` 情况下，要保存的日志才会输出在控制台，`test`||`release` 环境下，需要写入到文件的日志不会出现在控制台;


```sh
var log = require('zhuge-log');
var path = require('path');

log.setConfig({
    fileName: 'log-%DATE%.log',// <required> 日志路径
    pattern: 'YYYY-MM-DD',// <required> 日志格式
    logPath: '/data/logs/project/',//<required>日志路径
    emailCachePath: path.join(__dirname,'../../checklog/'),// 防止同一进程重发相同问题的邮件缓存路径，最好放到项目中，只会有一个文件txt
    project: 'project',// 当前项目名称
    env: 'test', // 修改当前环境 'develop' || 'test' || 'release'
    host: '',
    port: 000,
    secure: true,// true for 465, false for other ports
    user: 'haha@qq.com', // generated ethereal user
    pass: '123123213', // generated ethereal password
    from: 'asdfa@qq.com', // sender address
    to: 'fasdsad6@163.com', // list of receivers 多个邮箱","分开
    canSend: false,//是否可以发送邮件,只对ejs渲染出错是否发送邮件起作用，自定义邮件不起作用（false：不发送；true:发送）
});

// 添加邮件功能
module.exports = {
    logger: log.logger(),
    outPutLog: log.outPutLog,
    email: log.email
};
```

### 手动输出自定义日志

```sh
var zhugelog = require('./logger'); // 自己配置的上述文件
var logger = zhugelog.logger;
logger.error('保存前端js报错信息失败:'+e.message);
```

## 封装好的日志模板 

> `/logger/outPutLog.js/` 文件为封装好的日志模板 

```sh
var zhugelog = require('./logger'); // 自己配置的上述文件
var ejsLogger = zhugelog.outPutLog;
```

+ ejsLogger.appJsError ---------- app.js捕获到的404
+ ejsLogger.requestCatchError --- 请求接口catch error
+ ejsLogger.requestError -------- 接口返回状态异常
+ ejsLogger.ejsRenderError ------ ejs渲染出现空白页面
+ ejsLogger.requestCodeError ---- 接口返回code异常
+ ejsLogger.BrowersJsError ------ 前台js报错

## 1. 日志保存路径

> logPath 格式：`project-2016-12-11.log`日志信息，每天生成一个
> emailCachePath 格式：`2014-12-18.txt` 保存判断ejs报错是不是已发送过邮件的报错信息；

### 2. 在app.js中使用

+ 在app.js中作为中间件，在控制台输出可控格式日志；
+ 在app.js中捕获404等错误状态，并将其输出到文件；

```sh
var zhugelog = require('./logger');
var outPutLog = zhugelog.outPutLog;

// error handler
app.use(function (err, req, res, next) {
    // output error logs 
    outPutLog.appJsError(err,req);
	...others code
});

```

### 3. 在服务端请求接口的文件中使用

+ 保存`try{}catch(error){}` 中的error
+ 请求完成后，没能成功请求接口，保存日志；

```sh
var zhugelog = require('./logger');
var outPutLog = zhugelog.outPutLog;

req.post(url, urlPara, function (err, res, body) {
        var endTime = new Date().getTime();
        var durTime = endTime - strTime;
        // console.log(url);
        // console.log(urlPara);
        // 获取接口的响应时间 毫秒级
        // console.log(durTime,'接口响应时间****************************');
        try {
            if (err){
                // ==================catch error start==============================
                outPutLog.requestError({
                    durTime: durTime,
                    method: 'post',
                    req: request,
                    url: url,
                    urlPara: urlPara,
                    error: err,
                    body: body
                });
                // ==================catch error end==============================
                callback(err,requestDeal(err,{}));
            } 
            else {
                if (res && res.headers && res.headers['content-encoding'] && res.headers['content-encoding'] === 'gzip') {
                
                    zlib.unzip(body, function (err, buffer) {
                        try {                   
                            body = JSON.parse(buffer.toString());
                            if (body.code!==200 && body.success !== true && body.errcode !== 0){
                                // ==================catch error start==============================
                                outPutLog.requestCodeError({
                                    durTime: durTime,
                                    method: 'post',
                                    req: request,
                                    url: url,
                                    urlPara: urlPara,
                                    error: err,
                                    body: body
                                });
                                // ==================catch error end==============================
                            }                   
                            callback(null, requestDeal(err,body));
                        } catch (e) {
                            // ==================catch error start==============================
                            outPutLog.requestCodeError({
                                durTime: durTime,
                                method: 'post',
                                req: request,
                                url: url,
                                urlPara: urlPara,
                                error: e,
                                body: body
                            });
                            // ==================catch error end================================
                            callback(e,requestDeal(e,{}));
                        }
                    });
                } else {                
                    if (Buffer.isBuffer(body)) {
                        try {
                            // JSON.parse 可能报错
                            body = JSON.parse(body.toString());
                            if (body.code!==200 && body.success !== true && body.errcode !== 0){
                                // ==================catch error start==============================
                                outPutLog.requestCodeError({
                                    durTime: durTime,
                                    method: 'post',
                                    req: request,
                                    url: url,
                                    urlPara: urlPara,
                                    error: err,
                                    body: body
                                });
                                // ==================catch error end==============================
                            }
                            callback(null, requestDeal(err,body));
                        } catch (e) {
                            // ==================catch error start==============================
                            outPutLog.requestCodeError({
                                durTime: durTime,
                                method: 'post',
                                req: request,
                                url: url,
                                urlPara: urlPara,
                                error: e,
                                body: body
                            });
                            // ==================catch error end================================
                            callback(e,requestDeal(e,{}));
                        }
                        
                    } else {
                        // console.log(body,'body');
                        if (body.code!==200 && body.success !== true && body.errcode !== 0){
                            // ==================catch error start==============================
                            outPutLog.requestCodeError({
                                durTime: durTime,
                                method: 'post',
                                req: request,
                                url: url,
                                urlPara: urlPara,
                                error: err,
                                body: body
                            });
                            // ==================catch error end==============================
                        }
                        callback(null, requestDeal(err,body));
                    }
                }
            }
        } catch (e) {
            // ==================catch error start==============================
            outPutLog.requestCatchError({
                durTime: durTime,
                method: 'post',
                req: request,
                url: url,
                urlPara: urlPara,
                error: e,
                body: body
            });
            // ==================catch error end================================
            callback(e,requestDeal(e,{}));
        }
    });
```

### 4. 在render ejs 的时候使用

+ 将 ejs 渲染出错时的日志保存

```
var zhugelog = require('./logger');
var ejsLogger = zhugelog.outPutLog;

res.render(pagePath, {
    params: '',
},function (err,html){
	if (err) {
        ejsLogger.ejsRenderError({
            page: pagePath,
            req: req,
            error: err
        });
    }
    res.send(html);
});
```

### 5. 在其他情况下输出错误日志

```
var zhugelog = require('./logger');
var logger = zhugelog.logger;

logger.error('这里可能要出错，我也不知道为什么，这是一个手动输出日志文件的案例，格式视情况而定');

```

### 6. 发送邮件

```sh
var zhugelog = require('./logger');
var email = zhugelog.email;
// 附件
var attachments = [
        {   // file on disk as an attachment
            path: '/project/2018-10-30.log' // stream this file
        },
        {   // file on disk as an attachment
            path: '/project/2018-10-30.log' // stream this file
        }];
				
zhugelog.email('我是标题','我是内容',attachments || null,function (err,info){
     if (err) {
         console.log(err);
    } else {        
			console.log(info);
    }
 });
```

## License

[MIT](LICENSE)

Copyright (c) 2018-present, zhuge

[npm-image]: https://img.shields.io/npm/v/zhuge-log.svg
[npm-url]: https://npmjs.org/package/zhuge-log
[node-version-image]: https://img.shields.io/node/v/zhuge-log.svg
[node-version-url]: https://nodejs.org/en/download/
[downloads-image]: https://img.shields.io/npm/dm/zhuge-log.svg
[downloads-url]: https://npmjs.org/package/zhuge-log