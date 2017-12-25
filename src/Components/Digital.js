import React,{Component} from 'react';
import '../Less/Digital.less';
import GetBattery from './Child/GetBattery'; //电池电量
import PanelValue from './Child/PanelValue'; //实时刷新值
import DigitalCharts from './Child/DigitalCharts'; //实时曲线
import { observer, inject } from 'mobx-react';

let idArr = [];
const sensorField = ["温度","湿度","甲醛","CO2","PM2.5","VOC"];
const sensorUnit = ["℃","%RH","ug/m3","ppm","ug/m³","ug/m³"];

//数组是否包含某元素
function isContains(arr,obj){
    for(let i = 0; i < arr.length; i++){
        if(arr[i]===obj){
            return true;
        }
    }
    return false;
}

@inject('store')
@observer
export default class Digital extends Component{
    constructor(props){
        super(props);
        this.state = {
            idArr:[],
            selectedID:'', //已选择的ID
            prevSensordata:[0,0,0,0,0,0],
            sensorData:[0,0,0,0,0,0],//数据
            battery:null, //电量
            count:0, //X轴坐标
            isDisplay:false, //选择ID时清空
            isPush:true, //选择ID!=数据ID 图表不push数据点
            timeup: '', //时间戳
            prevTimeup: '', //上一次时间戳
        };
        this.changeID = this.changeID.bind(this);
    }

    componentWillMount() {
        this._isMounted = true;
        const { store } = this.props;
        const socket = store.socket;

        const p1 = new Promise((resolve) => {
            fetch('http://47.97.114.102:8080/api/getIDList')
                .then((response) => {
                    response.json().then(function(idList) {
                        idArr = idList;
                        resolve(idList);
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        });

        p1.then(function (idList) {
            fetch('http://47.97.114.102:8080/api/getOne', {
                method:'POST',
                headers: {
                    "Content-type":"application/json"
                },
                body: JSON.stringify({
                    id: idList[0]
                })
            })
                .then((response) => {
                    response.json().then(function(data) {
                        if(data.length!==0){
                            const msg = data[0];
                            if(this._isMounted){
                                this.setState({
                                    sensorData: [msg.temp, msg.humi, msg.ch2o, msg.co2, msg.pm2d5, msg.voc],
                                    battery: msg.battery,
                                    selectedID: msg.id,
                                    timeup: msg.time,
                                    isPush: true,
                                    isDisplay: false,
                                    count: 1,
                                    idArr: idArr,
                                })
                            }
                        }
                    }.bind(this));
                })
                .catch((err) => {
                    console.log(err);
                });
            }.bind(this));

        socket.on('sensordata_server', function (data) {
            if(!isContains(idArr,data.id)){
                idArr.push(data.id);
            }
            if(this._isMounted){
                if(idArr.length===1){
                    this.setState({
                        selectedID:idArr[0],
                        idArr:idArr,
                        isDisplay:true,
                        prevSensordata:[0,0,0,0,0,0],
                        sensorData:[data.temp,data.humi,data.ch2o,data.co2,data.pm2d5,data.voc],
                        battery:data.battery,
                        count:this.state.count+1,
                        isPush:true,
                        prevTimeup: '',
                        timeup: data.time
                    });
                }else{
                    this.setState((prevState, props) => ({
                        selectedID:prevState.selectedID,
                        idArr:idArr,
                        isDisplay:true,
                        prevSensordata:prevState.selectedID===data.id?prevState.sensorData:prevState.prevSensordata,
                        sensorData:prevState.selectedID===data.id?[data.temp,data.humi,data.ch2o,data.co2,data.pm2d5,data.voc]:prevState.sensorData,
                        battery:prevState.selectedID===data.id?data.battery:prevState.battery,
                        count:prevState.selectedID===data.id?prevState.count+1:prevState.count,
                        isPush:prevState.selectedID===data.id,
                        prevTimeup: prevState.selectedID===data.id?prevState.timeup: prevState.prevTimeup,
                        timeup:prevState.selectedID===data.id?data.time: prevState.timeup

                    }));
                }
            }
        }.bind(this));
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    //改变选择ID
    changeID(event) {
        const valueID = event.target.value;
        fetch('http://47.97.114.102:8080/api/getOne', {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                id: valueID
            })
        })
            .then((response) => {
                response.json().then(function (data) {
                    // console.log(data);
                    if (data.length !== 0) {
                        const msg = data[0];
                        if (this._isMounted) {
                            this.setState({
                                selectedID: valueID,
                                prevSensordata: this.state.sensorData,
                                sensorData: [msg.temp, msg.humi, msg.ch2o, msg.co2, msg.pm2d5, msg.voc],
                                battery: msg.battery,
                                isPush: true,
                                isDisplay: false,
                                count: 1,
                                timeup: msg.time,
                                prevTimeup: ''
                            })
                        }
                    }
                }.bind(this));
            })
            .catch((err) => {
                console.log(err);
            });
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
        return v;
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
                        <div className="col-md-6 info-left">
                            <span className="sensorid-t">Sensor ID</span>
                            <select className="form-control selectID" value={this.state.selectedID} onChange={this.changeID}>
                                {this.selectIDList()}
                            </select>
                            <GetBattery battery={this.state.battery}/>
                        </div>
                        <div className="col-md-6 info-right">
                            <span className="time-up">{this.state.timeup}</span>
                        </div>
                    </div>
                    <div className="digital-nums">
                        <ul className="col-md-10 col-md-offset-1">
                            {this.PanelValueList()}
                        </ul>
                    </div>
                    <div className="digital-charts">
                        <ul className="col-md-12">
                            {this.DigitalChartsList()}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}