import React,{Component} from 'react';
import '../Less/Navbar.less';

export default class Navbar extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <nav className="navbar navbar-default navbar-fixed-top">
                <div className="container-fluid">
                    <div className="navbar-left">
                        <img src= {require('../Images/logos.png')} className="logo"/>
                    </div>
                    <div className="collapse navbar-collapse navbar-right" id="navbar-example">
                        <ul className="nav navbar-nav">
                            <li className="active"><a href="#header">首页</a></li>
                            <li className=""><a href="#config">参数配置</a></li>
                            <li className=""><a href="#digital">实时监测</a></li>
                            <li className=""><a href="#history">历史数据</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        )
    }
}