import React,{Component} from 'react';
import CountUp from 'react-countup';

export default class PanelValue extends Component{
    constructor(props){
        super(props);
        this.state={
            prevValue:this.props.prevValue,
            fvalue:this.props.fvalue
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            prevValue:nextProps.prevValue,            
            fvalue: nextProps.fvalue
        });
    }

    render(){
        return(
            <li className="col-md-4">
                <div className="num-value">
                    <CountUp start={this.props.prevValue} end={this.props.fvalue} duration={1} decimals={2}/>
                </div>
                <p className="num-t">{this.props.field}<span>[{this.props.unit}]</span></p>
            </li>
        )
    }
}