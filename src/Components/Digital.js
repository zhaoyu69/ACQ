import React,{Component} from 'react';
import '../Less/Digital.less';
import GetBattery from './Child/GetBattery'; //电池电量
import PanelValue from './Child/PanelValue'; //实时刷新值
import DigitalCharts from './Child/DigitalCharts'; //实时曲线

let idArr = [];
const sensorField = ["温度","湿度","甲醛","CO2","PM2.5","VOC"];
const sensorUnit = ["℃","%RH","ppm","ppm","ug/m³","mg/m³"];

const io = require('socket.io-client');
const socket = io.connect('http://localhost:8888',{'forceNew':true});

//数组是否包含某元素
function isContains(arr,obj){
    for(let i = 0; i < arr.length; i++){
        if(arr[i]===obj){
            return true;
        }
    }
    return false;
}

export default class Digital extends Component{
    constructor(props){
        super(props);
        this.state = {
            selectedID:'', //已选择的ID
            idArr:[], //供选择的ID
            prevSensordata:[0,0,0,0,0,0],
            sensorData:[null,null,null,null,null,null],//数据
            id:'', //数据ID
            battery:null, //电量
            count:0, //X轴坐标
            isDisplay:true, //选择ID时清空
            isPush:true, //选择ID!=数据ID 图表不push数据点
        };
        this.changeID = this.changeID.bind(this);
    }

    componentDidMount(){
        socket.on('sensordata_server', function (data) {
            console.log(data);
            // socket.emit('sensordata_user', 'resolve all.'); //回复node
            if(!isContains(idArr,data.id)){
                idArr.push(data.id);
            }
            if(idArr.length===1){
                this.setState({
                    selectedID:idArr[0],
                    idArr:idArr,
                    id:data.id,
                    isDisplay:true,
                    prevSensordata:[0,0,0,0,0,0],
                    sensorData:[data.temp,data.humi,data.ch2o,data.co2,data.pm2d5,data.voc],
                    battery:data.battery,
                    count:this.state.count+1,
                    isPush:true,
                });
            }else{
                this.setState((prevState, props) => ({
                    selectedID:prevState.selectedID,
                    idArr:idArr,
                    id:data.id,
                    isDisplay:true,
                    prevSensordata:prevState.selectedID===data.id?prevState.sensorData:prevState.prevSensordata,
                    sensorData:prevState.selectedID===data.id?[data.temp,data.humi,data.ch2o,data.co2,data.pm2d5,data.voc]:prevState.sensorData,
                    battery:prevState.selectedID===data.id?data.battery:prevState.battery,
                    count:prevState.selectedID===data.id?prevState.count+1:prevState.count,
                    isPush:prevState.selectedID===data.id
                }));
            }
        }.bind(this));
    }

    //改变选择ID
    changeID(event){
        this.setState({
            selectedID:event.target.value,
            prevSensordata:[0,0,0,0,0,0],
            sensorData:[0,0,0,0,0,0],
            isDisplay:false,
            count:0,
            battery:null
        })
    }

    //实时显示值
    PanelValueList(){
        let v = this.state.sensorData.map(function(item,index){
            return (
                <PanelValue
                    key={index}
                    field={sensorField[index]}
                    unit={sensorUnit[index]}
                    fvalue={item}
                    prevValue={this.state.prevSensordata[index]}
                />
            )
        }.bind(this));
        return v;
    }

    //选择ID
    selectIDList(){
        let v = this.state.idArr.map(function(item,index){
            return (
                <option key={index} value={item}>{item}</option>
            )
        }.bind(this));
        return v;
    }

    //实时曲线
    DigitalChartsList(){
        let v = this.state.sensorData.map(function(item,index){
            return (
                <DigitalCharts
                    key={index}
                    index={index}
                    field={sensorField[index]}
                    unit={sensorUnit[index]}
                    sensorData={item}
                    count={this.state.count}
                    isDisplay={this.state.isDisplay}
                    isPush={this.state.isPush}
                />
            )
        }.bind(this));
        if(this.state.sensorData[0]===null||this.state.sensorData[0]===0){
            return null;
        }else{
            return v;
        }
    }

    render(){
        return(
            <div className="container digital">
                <div className="row digital-t">
                    <div className="col-md-8 col-md-offset-2 text-center">
                        <h3>实时监控平台</h3>
                        <p className="title_line"> </p>
                    </div>
                </div>
                <div className="row digital-body">
                    <div className="digital-info text-center">
                        <span className="sensorid-t">Sensor ID</span>
                        <select className="form-control selectID" value={this.state.selectedID} onChange={this.changeID}>
                            {this.selectIDList()}
                        </select>
                        <GetBattery battery={this.state.battery}/>
                    </div>
                    <div className="row digital-nums">
                        <ul className="col-md-10 col-md-offset-1">
                            {this.PanelValueList()}
                        </ul>
                    </div>
                    <div className="row digital-charts">
                        <ul className="col-md-12">
                            {this.DigitalChartsList()}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}