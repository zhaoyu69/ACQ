let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let mySocket = {};

//mongodb数据库操作
let mongodb = require('mongodb');
let serverdb = new mongodb.Server('localhost',27017,{auto_reconnect:true});
let db = new mongodb.Db('nodetest',serverdb,{safe:true});
let sensordata; //表

//serialport串口操作
let serialPort = require('serialport');
let port = {};
let portsName = [];

serialPort.list(function (err, ports) {
  // console.log(ports);
    ports.forEach(function(port) {
        portsName.push(port.comName);
    });
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/build/index.html');
});

server.listen(8080,function(){
  console.log('listening on *:8080');
});

//连接db
db.open(function(err, db){
  if(!err){
      console.log('connect db');
      db.createCollection('serialtest',function(err, collection){ //创建table
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

io.on('connect',function(socket){
  mySocket = socket;
  // console.log(mySocket);
  // 监听客户端查询条件
  mySocket.on("searchdata_user",function(cmd){
    // console.log(cmd);//包含id，开始时间和结束时间
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
        mySocket.emit("searchdata_server",result); //查询数据库结果
      }
    })
  });

  mySocket.on("serialconfig_request",function(res){ //客户端请求获取COM口
    if(res===1){
      mySocket.emit("serialconfig_server",portsName); //返回COM数组
    }
  });

  mySocket.on("serialconfig_isConn",function(){ //客户端请求串口是否打开
    if(JSON.stringify(port) === "{}"){
      mySocket.emit("serialconfig_isConn_return","false");
    }else{
      mySocket.emit("serialconfig_isConn_return","true");
    }
  });

  mySocket.on("serialconfig_cutdown",function(){ //客户端请求断开
    // console.log(port);
    if(JSON.stringify(port) === "{}"){

    }
    if(JSON.stringify(port) !== "{}"){
      port.close(function(){
        mySocket.emit("serialconfig_cutdown_return","OK");
        port = {};
      })
    }
  });

  mySocket.on("serialconfig_user",function(config){ //客户端串口配置
    // console.log(config);
    port = new serialPort(config.COM, {
      baudRate:config.bote,
      dataBits:parseInt(config.number),
      parity:config.crc,
      stopBits:parseInt(config.stop),
      flowControl:config.liu,
    });

    port.on("open", function () {
      console.log('port open');
      mySocket.emit("serialconfig_return","Connected"); //告诉客户端已经连上

        port.on('data', function(data) {
            let bufs = [];
          bufs.push(data);
          let buffer = Buffer.concat(bufs);
          console.log(buffer); // == console.log(data)

          let _document = {}; //json

          //协议解析
          if(buffer.length>=5){

            if(buffer[0]===0xCC && buffer[1]===0xDD){

              let key = buffer[2].toString(16); //ID
              // console.log(key);

              let len = buffer[3];//数据长度
              // console.log(len);

              if(buffer.length>=len+7){

                  let bufRecv = new Buffer(len+7);
                  buffer.copy(bufRecv, 0, 0, len+7);

                let mycrc = checkSum(bufRecv,len+7-1); //校验和
                // console.log(mycrc);
                // console.log(buffer[len+7-1].toString(16));

                if(mycrc!==buffer[len+7-1].toString(16)){
                    buffer.slice(0, len+7); //校验失败删除这一包数据
                    console.log("ECC error");
                    return;
                }

                  let temp = (buffer[4] * 256 + buffer[5]) / 10.0; //温度
                  let humi = (buffer[6] * 256 + buffer[7]) / 10.0; //湿度
                  let ch2o = (buffer[8] * 256 + buffer[9]) / 1000.0; //CH2O
                  let co2 = (buffer[10] * 256 + buffer[11]); //CO2
                  let pm2d5 = (buffer[12] * 256 + buffer[13]); //PM2.5
                  let voc = (buffer[14] * 256 + buffer[15]) / 1000.0; //voc
                  let battery = (buffer[16] * 256 + buffer[17]) / 1000.0; //电量
                  let nowtime = getNowFormatDate();
                // console.log(nowtime);

                // console.log(temp+" "+humi+" "+ch2o+" "+co2+" "+pm2d5+" "+battery+" ");

                _document = {
                  'id': key,
                  'temp':temp,
                  'humi':humi,
                  'ch2o':ch2o,
                  'co2':co2,
                  'pm2d5':pm2d5,
                  'voc':voc,
                  'battery':battery,
                  'time':nowtime
                };

                //插入数据=>mongodb
                sensordata.insert(_document,function(err,result){
                  if(err){
                    console.log('Error:'+err);
                  }else{
                    // console.log('Result:'+result);
                  }
                });

                mySocket.emit('sensordata_server', _document); //发送sensordata数据到客户端
                mySocket.on('sensordata_user', function (data) {
                  console.log(data);
                });
              }
                buffer.slice(0, len+7); //解析完成后清空缓存
            }
          }
        });
      // });
    });

  })
});

// console.log(new Date().toLocaleString()); //2017-08-31 11:46:01

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
  let currentdate = date.getFullYear() + seperator1 + timeArr[0] + seperator1 + timeArr[1]
          + " " + timeArr[2] + seperator2 + timeArr[3] + seperator2 + timeArr[4];
  return currentdate;
}

