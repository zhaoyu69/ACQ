import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import '../Less/History.less';
import DateTimeField from 'react-bootstrap-datetimepicker';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import HistoryCharts from './Child/HistoryCharts';

const idArr = ["*",1,2,3,4,5];
const FieldName = ["温度","湿度","甲醛","CO2","PM2.5","VOC"];
const sensorUnit = ["℃","%RH","ppm","ppm","ug/m³","mg/m³"];
var seriesData = [[],[],[],[],[],[]];
var products = [];
var socket = {};

export default class History extends Component{
    constructor(props){
        super(props);
        this.state = {
            selectedID:'',
            timestart:getNowFormatDate(),
            timeend:getNowFormatDate(),
            products:[],
            showCharts:false,
            count:0
        }
        this.changeID = this.changeID.bind(this);
        this.btnSearchClick = this.btnSearchClick.bind(this);
        this.changeTimeStart = this.changeTimeStart.bind(this);
        this.changeTimeEnd = this.changeTimeEnd.bind(this);
    }

    //改变选择ID
    changeID(event){
        this.setState({
            selectedID:event.target.value,
            showCharts:false
        })
    }

    //选择ID
    selectIDList(){
        let v = idArr.map(function(item,index){
            return (
                <option key={index} value={item}>{item}</option>
            )
        }.bind(this));
        return v;
    }

    componentDidMount(){
        socket = this.props.socket;
        this.setState({
            selectedID:ReactDOM.findDOMNode(this.refs.selectID).value,
        })

        //接收查询后的数据
        socket.on('searchdata_server', function (data) {
            products = [];
            seriesData = [[],[],[],[],[],[]];
            // console.log(data);

            data.forEach(function(element) {
                products.push({
                    id:element.id,
                    temp:element.temp,
                    humi:element.humi,
                    ch2o:element.ch2o,
                    co2:element.co2,
                    pm2d5:element.pm2d5,
                    voc:element.voc,
                    time:element.time
                })

                seriesData[0].push(element.temp);
                seriesData[1].push(element.humi);
                seriesData[2].push(element.ch2o);
                seriesData[3].push(element.co2);
                seriesData[4].push(element.pm2d5);
                seriesData[5].push(element.voc);

            }, this);

            if(data.length==0||this.state.selectedID=="*"){
                this.setState({
                    showCharts:false
                })
            }else{
                this.setState({
                    showCharts:true
                })
            }

            this.setState({
                products:products,
                count:data.length,
            })


        }.bind(this));
    }

    btnSearchClick(){
        socket = this.props.socket;
        let cmd = {
            id:this.state.selectedID,
            timestart:this.state.timestart,
            timeend:this.state.timeend
        }
        socket.emit("searchdata_user",cmd);
    }

    changeTimeStart(newdate){
        this.setState({
            timestart:newdate,
        })
    }

    changeTimeEnd(newdate){
        this.setState({
            timeend:newdate
        })
    }

    //历史曲线
    HistoryChartsList(){
        if(this.state.showCharts){
            let v = seriesData.map(function(item,index){
                return (
                    <HistoryCharts
                        key={index}
                        index={index}
                        legend={this.state.selectedID}
                        title={FieldName[index]}
                        unit={sensorUnit[index]}
                        series={item}
                        count={this.state.count}
                    />
                )
            }.bind(this));
            return v;
        }else{
            return null;
        }
    }

    render(){
        return(
            <div className="container history">
                <div className="row history-t">
                    <div className="col-md-8 col-md-offset-2 text-center">
                        <h3>历史数据查询</h3>
                        <p className="title_line"></p>
                    </div>
                </div>
                <div className="container history-body">
                    <div className="row search-condition">
                        <form className="container">
                            <div className="form-group col-md-2">
                                <label>编号</label>
                                <select className="form-control selectID" value={this.state.selectedID} onChange={this.changeID} ref="selectID">
                                    {this.selectIDList()}
                                </select>
                            </div>
                            <div className="form-group col-md-4">
                                <label>开始时间</label>
                                <DateTimeField
                                    dateTime={this.state.timestart}
                                    format="YYYY/MM/DD HH:mm:ss"
                                    inputFormat="YYYY/MM/DD HH:mm:ss"
                                    ref="timestart"
                                    onChange={this.changeTimeStart}
                                />
                            </div>
                            <div className="form-group col-md-4">
                                <label>结束时间</label>
                                <DateTimeField
                                    dateTime={this.state.timeend}
                                    format="YYYY/MM/DD HH:mm:ss"
                                    inputFormat="YYYY/MM/DD HH:mm:ss"
                                    ref="timeend"
                                    onChange={this.changeTimeEnd}
                                />
                            </div>
                            <div className="form-group col-md-2">
                                <button type="button" className="btn btn-default btnSearch" onClick={this.btnSearchClick}>查询</button>
                            </div>
                        </form>
                    </div>
                    <div className="row search-content">
                        <BootstrapTable
                            data={this.state.products}
                            striped={true}
                            hover={true}
                            pagination
                            search
                            searchPlaceholder='查询结果搜索...'
                            exportCSV csvFileName='sensordata.xls'
                            >
                            <TableHeaderColumn dataField="id" isKey={true} dataAlign="center" dataSort={true}>编号</TableHeaderColumn>
                            <TableHeaderColumn dataField="temp" dataAlign="center" dataSort={true}>温度[℃]</TableHeaderColumn>
                            <TableHeaderColumn dataField="humi" dataAlign="center" dataSort={true}>湿度[%RH]</TableHeaderColumn>
                            <TableHeaderColumn dataField="ch2o" dataAlign="center" dataSort={true}>甲醛[ppm]</TableHeaderColumn>
                            <TableHeaderColumn dataField="co2" dataAlign="center" dataSort={true}>CO2[ppm]</TableHeaderColumn>
                            <TableHeaderColumn dataField="pm2d5" dataAlign="center" dataSort={true}>PM2.5[μg/m³]</TableHeaderColumn>
                            <TableHeaderColumn dataField="voc" dataAlign="center" dataSort={true}>VOC[mg/m³]</TableHeaderColumn>
                            <TableHeaderColumn dataField="time" dataAlign="center" dataSort={true}>时间</TableHeaderColumn>
                        </BootstrapTable>

                        <ul className="span12" style={{marginTop:"20px"}}>
                            {this.HistoryChartsList()}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}

//格式化时间
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "/";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var days = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var timeArr = [month,days,hours,minutes,seconds];
    for(var i=0;i<timeArr.length;i++){
      if(timeArr[i] <= 9){
        timeArr[i] = "0" + timeArr[i];
      }
    }
    var currentdate = date.getFullYear() + seperator1 + timeArr[0] + seperator1 + timeArr[1]
            + " " + timeArr[2] + seperator2 + timeArr[3] + seperator2 + timeArr[4];
    return currentdate;
  }