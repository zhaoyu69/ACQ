import React,{Component} from 'react';
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts';

export default class HistoryCharts extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <li className="col-md-6" style={{paddingBottom:'40px'}}>
                <ReactEcharts 
                    option={this.Option()}
                    notMerge={true}
                    lazyUpdate={true}
                    onChartReady={this.onChartReadyCallback}
                />
            </li>
        )
    }

    Option(){
        let option = {
            title:{
                text:this.props.title+"面积图["+this.props.unit+"]"
            },
            tooltip:{
                trigger: 'axis',
            },
            toolbox:{

            },
            legend: {
                
            },
            xAxis:{
                type: 'category',
                boundaryGap: false,
                data:(function(){
                    let arr = [];
                    for(var i=1;i<=this.props.count;i++){
                        arr.push(i);
                    }
                    return arr;
                }.bind(this))()
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '50%'],
                splitLine: {
                    show: false
                }
            },
            dataZoom: [{
                type: 'inside',
                start: 0,
                end: 10
            }, {
                start: 0,
                end: 10,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            }],
            series:{
                name:"ID:"+this.props.legend,
                type:'line',
                smooth:true,
                symbol: 'none',
                areaStyle: {
                    normal: {
                         color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(40, 182, 252, 0.85)'
                        }, {
                            offset: 1,
                            color: 'rgba(28, 159, 255, 0.2)'
                        }])
                    }
                },itemStyle:{
                 normal:{
                     color:"#e4e4e4",
                     barBorderColor:"#e4e4e4",
                 }
                },
                data: this.props.series
            }
        }
        return option;
    }
}

