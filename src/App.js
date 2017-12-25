import React,{Component} from 'react';
import Scroll from 'react-scroll';

import './Less/index.less';

import Header from './Components/Header';
import SerialConfig from './Components/SerialConfig';
import Digital from './Components/Digital';
import History from './Components/History';
import Footer from './Components/Footer';

var io = require('socket.io-client');
var socket = io.connect('http://localhost:8080',{'forceNew':true});

var Link       = Scroll.Link;
var DirectLink = Scroll.DirectLink;
var Element    = Scroll.Element;
var Events     = Scroll.Events;
var scroll     = Scroll.animateScroll;
var scrollSpy  = Scroll.scrollSpy;

// var durationFn = function(deltaTop) {
//     return deltaTop;
// };

export default class App extends Component {
    constructor(props){
        super(props);
        this.state={
            isConnected:false,
        }
        // this.scrollToTop = this.scrollToTop.bind(this);
    }

    componentWillMount(){
        //请求获取串口连接状态
        socket.emit("serialconfig_isConn","isConn?");
        socket.on("serialconfig_isConn_return",function(res){
            if(res=="true"){
                this.setState({
                    isConnected:true
                })
            }else{
                this.setState({
                    isConnected:false
                })
            }
        }.bind(this));
    }

    componentDidMount(){
        socket.on("serialconfig_return",function(res){
            if(res=="Connected"){
                this.setState({
                    isConnected:true
                })
            }else{
                this.setState({
                    isConnected:false
                })
            }
        }.bind(this));

        socket.on("serialconfig_cutdown_return",function(res){
            if(res=="OK"){
                this.setState({
                    isConnected:false
                })
            }else{
                this.setState({
                    isConnected:true
                })
            }
        }.bind(this));

        Events.scrollEvent.register('begin', function() {
            //console.log("begin", arguments);
        });

        Events.scrollEvent.register('end', function() {
            //console.log("end", arguments);
        });

        scrollSpy.update();
    }

    // scrollToTop() {
    //     scroll.scrollToTop();
    // }

    componentWillUnmount() {
        Events.scrollEvent.remove('begin');
        Events.scrollEvent.remove('end');
    }

    render(){
        return(
            <div className="root">
                <nav className="navbar navbar-default navbar-fixed-top">
                    <div className="container-fluid">
                        <div className="navbar-left">
                            <img src= {require('./Images/logos.png')} className="logo"/>
                        </div>
                        <div className="collapse navbar-collapse navbar-right" id="navbar-example">
                            <ul className="nav navbar-nav">
                                <li><Link activeClass="active" className="nav_header" to="header" spy={true} smooth={true} duration={500} offset={-60} isDynamic={true}>首页</Link></li>
                                <li><Link activeClass="active" className="nav_config" to="config" spy={true} smooth={true} duration={500} offset={-60} isDynamic={true}>参数配置</Link></li>
                                <li><Link activeClass="active" className="nav_digital" to="digital" spy={true} smooth={true} duration={500} offset={-60} isDynamic={true}>实时监测</Link></li>
                                <li><Link activeClass="active" className="nav_history" to="history" spy={true} smooth={true} duration={500} offset={-60} isDynamic={true}>历史数据</Link></li>
                            </ul>
                        </div>
                    </div>
                </nav>

                <Element name="header" className="element" >
                    <Header />
                </Element>
                <Element name="config" className="element" >
                    <SerialConfig socket={socket} isConnected={this.state.isConnected}/>
                </Element>
                <Element name="digital" className="element" >
                    {this.state.isConnected?<Digital socket={socket}/>:null}
                </Element>
                <Element name="history" className="element" >
                    <History socket={socket}/>
                </Element>
                <Footer />
            </div>
        )
    }
}