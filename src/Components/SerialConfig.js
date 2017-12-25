import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import '../Less/SerialConfig.less';

let portsArr = [];

export default class SerialConfig extends Component{
    constructor(props){
        super(props);
        this.state={
            COM:'',
            bote:115200,
            number:8,
            crc:'none',
            stop:1,
            liu:'none',
            portsArr:portsArr,
            isConnected:props.isConnected,
            connText:'',
            isEnter:false,
        };
        this.connectClick = this.connectClick.bind(this);
        this.COMChange = this.COMChange.bind(this);
        this.boteChange = this.boteChange.bind(this);
        this.numberChange = this.numberChange.bind(this);
        this.crcChange = this.crcChange.bind(this);
        this.stopChange = this.stopChange.bind(this);
        this.liuChange = this.liuChange.bind(this);
        this.frameMouseEnter = this.frameMouseEnter.bind(this);
        this.frameMouseLeave = this.frameMouseLeave.bind(this);
    }

    componentWillMount(){
        let socket = this.props.socket;
        socket.emit("serialconfig_request",1); //获取COM口请求
    }

    componentDidMount(){
        let socket = this.props.socket;
        socket.on("serialconfig_server",function(portsName){
            // console.log(portsName);
            this.setState({
                portsArr : portsName
            },function(){
                this.setState({
                    COM:this.state.portsArr[0],
                    bote:parseInt(ReactDOM.findDOMNode(this.refs.bote).value),
                    number:ReactDOM.findDOMNode(this.refs.number).value,
                    crc:ReactDOM.findDOMNode(this.refs.crc).value,
                    stop:ReactDOM.findDOMNode(this.refs.stop).value,
                    liu:ReactDOM.findDOMNode(this.refs.liu).value
                })
            })
        }.bind(this));
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.isConnected){
            this.setState({
                connText:"断开"
            })
        }else{
            this.setState({
                connText:"连接"
            })
        }
    }

    COMList(){
        let COMOption = this.state.portsArr.map(function(item,index) {
            return(
                <option key={index} value={item}>{item}</option>
            )
        }.bind(this));
        return COMOption;
    }

    connectClick(event){
        let socket = this.props.socket;
        if(event.target.value==="连接"){
            let _config = {
                COM:this.state.COM,
                bote:this.state.bote,
                number:this.state.number,
                crc:this.state.crc,
                stop:this.state.stop,
                liu:this.state.liu
            };
            socket.emit("serialconfig_user",_config);
        }else if(event.target.value==="断开"){
            socket.emit("serialconfig_cutdown",1);
        }
    }

    COMChange(event){
        this.setState({
            COM:event.target.value
        })
    }

    boteChange(event){
        this.setState({
            bote:event.target.value
        })
    }

    numberChange(event){
        this.setState({
            number:event.target.value
        })
    }

    crcChange(event){
        this.setState({
            crc:event.target.value
        })
    }

    stopChange(event){
        this.setState({
            stop:event.target.value
        })
    }

    liuChange(event){
        this.setState({
            liu:event.target.value
        })
    }

    frameMouseEnter(){
        this.setState({
            isEnter:true
        })
    }

    frameMouseLeave(){
        this.setState({
            isEnter:false
        })
    }

    render(){
        return(
            <div className="container config">
                <div className="row">
                    <div className="config-left col-md-6">
                        <div className="triangle"> </div>
                    </div>
                    <div className="config-right col-md-6" onMouseEnter={this.frameMouseEnter} onMouseLeave={this.frameMouseLeave}>
                        <div className={['borderBottom', this.state.isEnter && 'borderBottom-animate'].join(' ')}></div>
                        <div className="text-center">
                            <h3>串口参数配置</h3>
                        </div>
                        <div className="row center-block config-body">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label className="col-sm-4 control-label">串口</label>
                                    <select className="col-sm-8" name="COM" ref="COM" value={this.state.COM} onChange={this.COMChange}>
                                        {this.COMList()}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="col-sm-4 control-label">波特率</label>
                                    <select className="col-sm-8" name="bote" ref="bote" value={this.state.bote} onChange={this.boteChange}>
                                        <option value="9600">9600</option>
                                        <option value="19200">19200</option>
                                        <option value="38400">38400</option>
                                        <option value="57600">57600</option>
                                        <option value="115200">115200</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="col-sm-4 control-label">数据位</label>
                                    <select className="col-sm-8" name="number" ref="number" value={this.state.number} onChange={this.numberChange}>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>
                                        <option value="8">8</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="col-sm-4 control-label">校验位</label>
                                    <select className="col-sm-8" name="crc" ref="crc" value={this.state.crc} onChange={this.crcChange}>
                                        <option value="none">None</option>
                                        <option value="even">Even</option>
                                        <option value="odd">Odd</option>
                                        <option value="mark">Mark</option>
                                        <option value="space">Space</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="col-sm-4 control-label">停止位</label>
                                    <select className="col-sm-8" name="stop" ref="stop" value={this.state.stop} onChange={this.stopChange}>
                                        <option value="1">1</option>
                                        <option value="1.5">1.5</option>
                                        <option value="2">2</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="col-sm-4 control-label">流控</label>
                                    <select className="col-sm-8" name="liu" ref="liu" value={this.state.liu} onChange={this.liuChange}>
                                        <option value="none">None</option>
                                        <option value="rts/cts">RTS/CTS</option>
                                        <option value="xon/xoff">XON/XOFF</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <input type="button" value={this.state.connText} ref="btnConn" className='btnConnect col-sm-8 col-sm-offset-2 text-center' onClick={this.connectClick} />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}