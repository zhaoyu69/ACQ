import React,{Component} from 'react';
import '../Less/Header.less';

export default class Header extends Component {
    constructor(props){
        super(props);
        this.state={
            parallaxstyle:{}
        }
        this.parallaxMove = this.parallaxMove.bind(this);
    }

    parallaxMove(e){
        var x = (e.pageX * -1/10), y = (e.pageY * -1/10);
        this.setState({
            parallaxstyle:{
                "backgroundPosition":x + 'px ' + y + 'px',
            }
        })
    }

    render(){
        return(
            <div className="container header" onMouseMove={this.parallaxMove} style={this.state.parallaxstyle}>
                <div className="row title">
                    <h1 className="text-center">
                        南京高华科技股份有限公司
                    </h1>
                    <p className="text-center">
                        NANJING GOVA TECHNOLOGY CO.,LTD.
                    </p>
                </div>
            </div>
        )
    }
}