/**
 * 输出日志模板
 * zhuge 2018-12-10 15:39
 * last modify time: 2018-12-10 13:35
 * last modify name: zhuge
 */
var logger = require('./index');
var logUtil = require('./logUtil');
var checkLogToSend = require('./checkLogToSend'); // ejs 空白页，发送日志

// 需要保存的cookie
// ['token','qtoken','uid','city_code','city_name','city_id','spread','pass_token','newtoken','houseType','device'];
var saveCookie = function (req){
  try {
    var result = {};
    var cookies = req.cookies;
    // 需要保存的关键词
    var keyword = ['token','qtoken','uid','city_code','city_name','city_id','spread','pass_token','newtoken','houseType','device'];
    for (var i=0;i<keyword.length;i++) {
      for (var key in cookies) {
        // 正则匹配
        var reg = new RegExp(keyword[i]);
        var flag = reg.test(key);
        if ( flag ) {
          result[key] = cookies[key];
        }
      }
    }
    return result;
  } catch (error) {
    return {};
  }
};
/**
 * app.js 中捕获异常输出日志
 * @param {Object} err 错误信息
 * @param {Object} req request信息
 */
var appJsError = function (err, req) {
  logger().error({
    type: 'APP_JS_ERROR',
    err_name: err ? err.name : '',
    message: err ? err.message : 'appJsError',
    client_ip: logUtil.getClientIp(req),
    client_url: logUtil.getClientUrl(req),
    method: req.method,
    cookie: saveCookie(req),
    // err_stack: err ? err.stack : ''
  });
};

/**
 * 请求接口捕获error
 * @param {Objcet} options
 */
var requestCatchError = function (options) {
  logger().error({
    type: 'REQUEST_CATCH_ERROR',
    err_name: options.error ? options.error.name : '', // 错误信息
    message: options.error ? options.error.message : 'requestCatchError',// 错误信息
    client_ip: logUtil.getClientIp(options.req), // 客户端ip
    client_url: logUtil.getClientUrl(options.req), // 客户端url
    method: options.method, // 请求方式
    dur_time: options.durTime, // 接口请求时间
    api_url: options.url, // 接口地址
    request_params: options.urlPara, // 请求参数
    body: options.body, // 接口返回参数
    cookie:saveCookie(options.req),
    err_stack: options.error ? options.error.stack : ''// 错误信息
  });
};

/**
 * 请求接口返回error
 * @param {Objcet} options
 */
var requestError = function (options) {
  logger().error({
    type: 'REQUEST_ERROR',
    err_name: options.error ? options.error.name : '', // 错误信息
    message: options.error ? options.error.message : 'requestError',// 错误信息
    client_ip: logUtil.getClientIp(options.req), // 客户端ip
    client_url: logUtil.getClientUrl(options.req), // 客户端url
    method: options.method, // 请求方式
    dur_time: options.durTime, // 接口请求时间
    api_url: options.url, // 接口地址
    request_params: options.urlPara, // 请求参数
    body: options.body, // 接口返回参数
    cookie:saveCookie(options.req),
    err_stack: options.error ? options.error.stack : ''// 错误信息
  });
};

/**
 * 请求接口成功，状态异常
 * @param {Objcet} options
 */
var requestCodeError = function (options) {
  logger().error({
    type: 'REQUEST_CODE_ERROR',
    err_name: options.error ? options.error.name : '', // 错误信息
    message: options.error ? options.error.message : 'requestCodeError',// 错误信息
    client_ip: logUtil.getClientIp(options.req), // 客户端ip
    client_url: logUtil.getClientUrl(options.req), // 客户端url
    method: options.method, // 请求方式
    dur_time: options.durTime, // 接口请求时间
    api_url: options.url, // 接口地址
    request_params: options.urlPara, // 请求参数
    body: Buffer.isBuffer(options.body) ? 'is buffer ' : options.body, // 接口返回参数
    cookie:saveCookie(options.req),
    err_stack: options.error ? options.error.stack : '' // 错误信息
  });
};

/**
 * 捕获ejs渲染error日志,ejs 不渲染errName ,errMessage,errStack ，直接输出error信息，防止格式错乱找不到bug
 * @param {Objcet} options
 * @param {String} options.page ejs页面模板路径
 * @param {String} options.req request
 * @param {Objcet} options.error 错误信息
 */
var ejsRenderError = function (options) {
  var errorlog = {
    type: 'EJS_RENDER_ERROR',
    err_name: options.error ? options.error.name : '', // 错误信息
    message: options.error ? options.error.message : 'ejsRenderError',// 错误信息
    client_ip: logUtil.getClientIp(options.req), // 客户端ip
    client_url: logUtil.getClientUrl(options.req), // 客户端url
    method: options.req.method, // 请求方式
    page_path: options.page,// 页面或者模板对应地址
    cookie:saveCookie(options.req),
    err_stack:  options.error ? options.error.stack : '' // 错误信息
  };
  var emailText = JSON.stringify(errorlog);
  checkLogToSend(emailText);
  logger().error(errorlog);
};

/**
 * 保存前端js报错
 * @param {Objcet} options
 * @param {String} options.page ejs页面模板路径
 * @param {String} options.req request
 * @param {Objcet} options.error 错误信息
 * 
 * window.onerror= function (message, url, line, column, error) {
        var data = {
            message: message,
            url: url,
            location_href: window.location.href,
            line: line,
            column: column,
            err_message: error.message,
            err_stack: error.stack,
            timestamp: new Date().getTime()
        };
        zgrequest.post('/ask/zhugefelogs/save', data,function (res){});
    };

    // 保存前端js报错信息 
    router.post('/ask/logs/save', function (req, res, next) {
      try {
        outPutLog.BrowersjsError(req);
        outPutLog.BrowersJsError(req);
        res.json({});
      } catch (e){
        logger().error('保存前端js报错信息失败:'+e.message);
        res.json({});
      }
    });
 */
var BrowersJsError = function (req) {
  var options = req.body;
  logger().error({
    type: 'BROWERS_JS_ERROR',
    message: options.message || 'BrowersJsError',
    err_message: options.err_message, // 错误信息
    line: options.line, // 错误信息行
    column: options.column, // 错误信息列
    location_href: options.location_href, // 错误页面路由
    url: options.url, // 报错的js路径
    brower_time: options.timestamp, // 错误信息浏览器时间
    err_stack: options.err_stack, // 错误信息详情
    cookie: saveCookie(req),
    client_ip: logUtil.getClientIp(req), // 客户端ip
    client_url: logUtil.getClientUrl(req), // 客户端url
  });
};

module.exports = {
  appJsError: appJsError,
  requestCatchError: requestCatchError,
  requestError: requestError,
  ejsRenderError: ejsRenderError,
  requestCodeError: requestCodeError,
  BrowersJsError: BrowersJsError
};
