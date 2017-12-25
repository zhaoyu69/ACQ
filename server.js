const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);

//读取.config endpoint
const rf = require('fs');
const _endpoint = rf.readFileSync("./.config","utf-8");
const _arr = _endpoint.split(':');
const _ip = _arr[0];
const _port = parseInt(_arr[1].substring(0, _arr[1].indexOf('/')));
const _path = _arr[1].substring(_arr[1].indexOf('/'));

const options = {
    hostname: _ip,
    port: _port,
    path: _path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }
};
let repost = {};

//中间件
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));// for parsing application/json
app.use(bodyParser.json()); // for parsing application/x-www-form-urlencoded

//mongodb数据库操作
const mongodb = require('mongodb');
const serverdb = new mongodb.Server('localhost',27017,{auto_reconnect:true});
const db = new mongodb.Db('nodetest',serverdb,{safe:true});
let sensordata; //表

//连接db
db.open(function(err, db){
    if(!err){
        console.log('connect db');
        db.createCollection('acq1db',function(err, collection){ //创建table
            if(err){
                console.log(err);
            }else{
                sensordata = collection;
            }
        });
    }else{
        console.log(err);
    }
});

//udp通讯
const dgram = require('dgram');
let serverSocket = dgram.createSocket('udp4');

//express 发送主页 使用静态资源
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/dist/index.html');
});
app.use(express.static('dist'));

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

//api
app.get('/api/getIDList', function (req, res) {
    const idArr = [];
    sensordata.find({}, {id:1, _id:0})
        .sort({id: 1})
        .toArray(function (err, result) {
            if(err){
                console.log(err);
            }else{
                result.map(function (item) {
                    if(!isContains(idArr, item.id)){
                        idArr.push(item.id)
                    }
                });
                res.send(idArr);
            }
        });
});

app.post('/api/getOne', function (req, res) {
    const _id = req.body.id;
    sensordata.find({id: _id})
        .sort({time: -1})
        .limit(1)
        .toArray(function (err, result) {
            if(err) console.log(err);
            else{
                res.send(result);
            }
        })
});

app.post('/api/searchdata', function (req, res) {
    const cmd = req.body;
    let condition;
    if(cmd.id==="*"){ //查询所有
        condition={
            time:{
                $gte:cmd.timestart,
                $lte:cmd.timeend
            }
        }
    }else{ //查询单只
        condition={
            id:cmd.id,
            time:{
                $gte:cmd.timestart,
                $lte:cmd.timeend
            }
        }
    }

    sensordata.find(condition).toArray(function(err,result){
        if(err){
            console.log("Error:"+err);
        }else{
            // console.log(result);
            res.send(result); //查询数据库结果
        }
    })
});

server.listen(8080,function(){
    console.log('listening on *:8080');
});

io.on('connect',function(socket){});

serverSocket.bind(3001);

serverSocket.setMaxListeners(100);

serverSocket.on('error', function (err) {
    console.log(`server error:\n${err.stack}`);
    serverSocket.close();
});

serverSocket.on('listening', () => {
    const address = serverSocket.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

serverSocket.on("message", function (msg, rinfo) {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    let bufs = [];
    bufs.push(msg);
    let buffer = Buffer.concat(bufs);
    console.log(buffer); // == console.log(data)

    let _document = {}; //json

    //协议解析
    if(buffer.length>=5){

        if(buffer[0]===0xCC && buffer[1]===0xDD){

            let key = (buffer[2]*256 + buffer[3]).toString(); //ID
            // console.log(key);

            let len = buffer[4];//数据长度
            // console.log(len);

            if(buffer.length>=len+6){

                let bufRecv = new Buffer(len+6);
                buffer.copy(bufRecv, 0, 0, len+6);

                let mycrc = checkSum(bufRecv,len+6-1); //校验和
                // console.log(mycrc);
                // console.log(buffer[len+7-1].toString(16));

                if(mycrc!==buffer[len+6-1].toString(16)){
                    buffer.slice(0, len+6); //校验失败删除这一包数据
                    console.log("ECC error");
                    return;
                }

                let temp = (buffer[5] * 256 + buffer[6]) / 10.0; //温度
                let humi = (buffer[7] * 256 + buffer[8]) / 10.0; //湿度
                let choh = (buffer[9] * 256 + buffer[10]) / 1000.0; //CH2O
                let co2 = (buffer[11] * 256 + buffer[12]); //CO2
                let pm2d5 = (buffer[13] * 256 + buffer[14]); //PM2.5
                let voc = (buffer[15] * 256 + buffer[16]) / 1000.0; //voc
                let battery = buffer[17].toString(); //电量
                let nowtime = getNowFormatDate();

                _document = {
                    'id': key,
                    'temp':temp,
                    'humi':humi,
                    'ch2o':choh,
                    'co2':co2,
                    'pm2d5':pm2d5,
                    'voc':voc,
                    'battery':battery,
                    'time':nowtime
                };

                repost = {
                    "id": key,
                    "name": "sensor_" + key,
                    "time": nowtime,
                    "data": {
                        "tempValue": temp,
                        "humidityValue": humi,
                        "HCHOValue": choh,
                        "co2Value": co2,
                        "pm25Value": pm2d5,
                        "TVOCValue": voc,
                        "Power": battery,
                        "tempUnit": "℃",
                        "humidityUnit": "%RH",
                        "HCHOUnit": "ug/m³",
                        "co2Unit": "ppm",
                        "pm25Unit": "ug/m³",
                        "TVOCUnit": "ug/m³",
                        "PowerUnit": "%"
                    },
                    "alarm":{
                        "alarmCode":"",
                        "alarmInfo":"",
                        "alarmtime":""
                    }
                };

                //插入数据=>mongodb
                sensordata.insert(_document,function(err){
                    if(err){
                        console.log('Error:'+err);
                    }
                });

                //广播发送到页面
                io.emit('sensordata_server', _document);

                //http 转发
                const req = http.request(options, function (res) {
                    console.log('STATUS: ' + res.statusCode);
                    // console.log('HEADERS: ' + JSON.stringify(res.headers));
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        console.log('BODY: ' + chunk);
                    });
                });

                req.on('error', function (err) {
                    console.log('post err:' + err.message);
                });

                req.write(JSON.stringify(repost));
                req.end();
            }
            buffer.slice(0, len+6); //解析完成后清空缓存
        }
    }
});

//校验和
function checkSum(buffer,len){
    let ir = 0;
    for(let i=0;i<len;i++){
        ir += buffer[i];
    }
    ir&=0xff; //补码
    ir = (255-ir+1).toString(16);
    return ir;
}

//格式化时间
function getNowFormatDate() {
    let date = new Date();
    let seperator1 = "/";
    let seperator2 = ":";
    let month = date.getMonth() + 1;
    let days = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let timeArr = [month,days,hours,minutes,seconds];
    for(let i=0;i<timeArr.length;i++){
        if(timeArr[i] <= 9){
            timeArr[i] = "0" + timeArr[i];
        }
    }
    return date.getFullYear() + seperator1 + timeArr[0] + seperator1 + timeArr[1]
          + " " + timeArr[2] + seperator2 + timeArr[3] + seperator2 + timeArr[4];
}

//数组是否包含某元素
function isContains(arr,obj){
    for(let i = 0; i < arr.length; i++){
        if(arr[i]===obj){
            return true;
        }
    }
    return false;
}

