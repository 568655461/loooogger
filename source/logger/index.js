/**
 * 日志文件
 * zhuge 2018-12-10 13:35
 * last modify time: 2018-12-11 17:42
 * last modify name: zhuge 
 * 
 * https://github.com/winstonjs/winston-daily-rotate-file#readme
 * https://github.com/winstonjs/winston#formats
 */
'use strict';
var winston =  require('winston');
require('winston-daily-rotate-file');
var config = require('../config');
var moment = require('moment');

/**
 * datePattern: A string representing the moment.js date format to be used for rotating. The meta characters used in this string will dictate the frequency of the file rotation. For example, if your datePattern is simply 'HH' you will end up with 24 log files that are picked up and appended to every day. (default 'YYYY-MM-DD')
 * zippedArchive: A boolean to define whether or not to gzip archived log files. (default 'false')
 * filename: Filename to be used to log to. This filename can include the %DATE% placeholder which will include the formatted datePattern at that point in the filename. (default: 'winston.log.%DATE%)
 * dirname: The directory name to save log files to. (default: '.')
 * stream: Write directly to a custom stream and bypass the rotation capabilities. (default: null)
 * maxSize: Maximum size of the file after which it will rotate. This can be a number of bytes, or units of kb, mb, and gb. If using the units, add 'k', 'm', or 'g' as the suffix. The units need to directly follow the number. (default: null)
 * maxFiles: Maximum number of logs to keep. If not set, no logs will be removed. This can be a number of files or number of days. If using days, add 'd' as the suffix. (default: null)
 * options: An object resembling https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options indicating additional options that should be passed to the file stream. (default: { flags: 'a' })
 */

// daily rotate file
var transportFile = function (){ 
    return new (winston.transports.DailyRotateFile)({
        filename: config.getConfig().fileName,
        dirname: config.getConfig().logPath,
        datePattern: config.getConfig().pattern,
        zippedArchive: config.getConfig().zippedArchive || false,
        maxSize: null, //'20m' 文件大小
        maxFiles: null //'14d' 保存天数
    });
};

// console 
var transportConsole = new winston.transports.Console();

// 只有本地开发时才可以控制台输出日志
// 'develop' || 'test' || 'release'
var transports = function (){
    if (config.getConfig().env === 'develop') {
        return [transportFile(),transportConsole];
    }
    if (config.getConfig().env === 'test') {
        return [transportFile()];
    } 
    if (config.getConfig().env === 'release') {
        return [transportFile()];
    } 
    return [transportFile(),transportConsole];
};

// transportFile().on('rotate', function (oldFilename, newFilename) {
//     // do something fun
// });
var myformat = winston.format.printf(function (info){
    info.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    info.processid = process.pid;
    info.project = config.getConfig().project;
    return JSON.stringify(info);
});

// 日志实例
function logger () {
    return  winston.createLogger({
        level: 'warn', // 只有warn || error 的时候可以保存
        format: winston.format.combine(
            myformat
        ),
        transports: transports()
    });
}

module.exports = logger;