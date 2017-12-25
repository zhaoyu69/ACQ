import React,{Component} from 'react';
import '../Less/SerialConfig.less';
import Spin from 'antd/lib/spin';

const io = require('socket.io-client');
const socket = io.connect('http://localhost:8888',{'forceNew':true});

export default class SerialConfig extends Component{
    constructor(props){
        super(props);
        this.state={
            ip:'0.0.0.0',
            port:4011,
            isConnected:false,
            connText:'连接',
            loading: true
        };
        this.connectClick = this.connectClick.bind(this);
        this.ipChange = this.ipChange.bind(this);
        this.portChange = this.portChange.bind(this);
    }

    componentDidMount(){
        this.setState({
            loading: false,
        });
        //请求获取串口连接状态
        socket.emit("serialconfig_isConn","isConn?");
        socket.on("serialconfig_isConn_return",function(res){
            if(res==="true"){
                this.setState({
                    isConnected:true
                })
            }else{
                this.setState({
                    isConnected:false
                })
            }
        }.bind(this));

        socket.emit("serialconfig_request",1); //获取ip地址请求
        socket.on("serialconfig_server",function(ipAddress){
            this.setState({
                ip: ipAddress
            })
        }.bind(this));

        socket.on("serialconfig_return",function(res){
            if(res==="Connected"){
                this.setState({
                    isConnected:true,
                    loading: false
                })
            }else{
                this.setState({
                    isConnected:false,
                    loading: false
                })
            }
        }.bind(this));

        socket.on("serialconfig_cutdown_return",function(res){
            if(res==="OK"){
                this.setState({
                    isConnected:false,
                    loading: false
                })
            }else{
                this.setState({
                    isConnected:true,
                    loading:false
                })
            }
        }.bind(this));
    }

    connectClick(event){
        this.setState({
            loading: true,
        });
        if(event.target.value==="连接"){
            let _config = {
                ip:this.state.ip,
                port:this.state.port,
            };
            socket.emit("serialconfig_user",_config);
        }else if(event.target.value==="断开"){
            socket.emit("serialconfig_cutdown",1);
        }
    }

    ipChange(event){
        this.setState({
            ip:event.target.value
        })
    }

    portChange(event){
        this.setState({
            port:event.target.value
        })
    }

    render(){
        return(
            <div className="container config">
                <div className="row">
                    <div className="config-left col-md-6">
                        <div className="triangle"> </div>
                    </div>
                    <div className="config-right col-md-6">
                        <div className="text-center">
                            <h3>参数配置</h3>
                        </div>
                        <div className="row center-block config-body">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label className="col-sm-2 control-label">IP</label>
                                    <div className="col-sm-10">
                                        <input className="form-control" value={this.state.ip} onChange={this.ipChange} disabled={true}/>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="col-sm-2 control-label">端口</label>
                                    <div className="col-sm-10">
                                        <input className="form-control" value={this.state.port} onChange={this.portChange} type="text" />
                                    </div>
                                </div>
                                <Spin spinning={this.state.loading}>
                                    <div className="form-group">
                                        <input type="button" value={this.state.connText} ref="btnConn" className='btnConnect col-sm-8 col-sm-offset-3 text-center' onClick={this.connectClick} />
                                    </div>
                                </Spin>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}