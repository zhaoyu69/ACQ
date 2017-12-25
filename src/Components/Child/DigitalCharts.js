import React,{Component} from 'react';
import ReactEcharts from 'echarts-for-react';

let xAxisData = {temp:[],humi:[],ch2o:[],co2:[],pm2d5:[],voc:[]};
let seriesData = {temp:[],humi:[],ch2o:[],co2:[],pm2d5:[],voc:[]};
const XMax = 10;

export default class DigitalCharts extends Component{
    constructor(props){
        super(props);
        this.state={
            sensorData:props.sensorData,
            count:props.count,
            isDisplay:props.isDisplay,
            isPush:props.isPush,
            xAxisData:xAxisData,
            seriesData:seriesData
        }
    }

    componentDidMount(){
        this.setState({
            xAxisData:{temp:[],humi:[],ch2o:[],co2:[],pm2d5:[],voc:[]},
            seriesData:{temp:[],humi:[],ch2o:[],co2:[],pm2d5:[],voc:[]}
        })
    }

    render(){
        return(
            <li className="col-md-4">
                <ReactEcharts
                    option={this.Option()}
                    notMerge={true}
                    lazyUpdate={true}
                    onChartReady={this.onChartReadyCallback}
                />
            </li>
        )
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            sensorData:nextProps.sensorData,
            count:nextProps.count,
            isDisplay:nextProps.isDisplay,
            isPush:nextProps.isPush,
        });
    }

    myxAxisDate(obj){
        const { isDisplay,isPush, count } = this.state;
        const { index } = this.props;
        if(isDisplay){
            obj[index] = obj[index] || [];
            if(isPush){
                obj[index].length>=XMax?obj[index].shift():obj[index];
                obj[index].push(count);
            }
        }else{
            obj[index] = [];
        }
        return obj[index];
    }

    mySeriesData(obj){
        const { isDisplay,isPush, sensorData } = this.state;
        const { index } = this.props;
        if(isDisplay){
            obj[index] = obj[index] || [];
            if(isPush){
                obj[index].length>=XMax?obj[index].shift():obj[index];
                obj[index].push(sensorData);
            }
        }else{
            obj[index] = [];
        }
        return obj[index];
    }

    Option(){
        let option = {
            title:{
                text:this.props.field + '曲线 [' + this.props.unit + ']',
                textStyle: {
                    fontWeight: 'normal',
                    fontSize: '16'
                }
            },
            tooltip:{
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#283b56'
                    }
                }
            },
            xAxis:{
                type: 'category',
                boundaryGap: false,
                data: (function(){
                    switch(this.props.index){
                        case 0:return this.myxAxisDate(this.state.xAxisData.temp);break;
                        case 1:return this.myxAxisDate(this.state.xAxisData.humi);break;
                        case 2:return this.myxAxisDate(this.state.xAxisData.ch2o);break;
                        case 3:return this.myxAxisDate(this.state.xAxisData.co2);break;
                        case 4:return this.myxAxisDate(this.state.xAxisData.pm2d5);break;
                        case 5:return this.myxAxisDate(this.state.xAxisData.voc);break;
                    }
                }.bind(this))()
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                splitLine: {
                    show: false
                }
            },
            series:{
                name:'温度',
                type:'line',
                smooth : 0.3,
                data: (function(){
                    switch(this.props.index){
                        case 0:return this.mySeriesData(this.state.seriesData.temp);break;
                        case 1:return this.mySeriesData(this.state.seriesData.humi);break;
                        case 2:return this.mySeriesData(this.state.seriesData.ch2o);break;
                        case 3:return this.mySeriesData(this.state.seriesData.co2);break;
                        case 4:return this.mySeriesData(this.state.seriesData.pm2d5);break;
                        case 5:return this.mySeriesData(this.state.seriesData.voc);break;
                    }
                }.bind(this))()
            }
        };

        return option;
    }
}

