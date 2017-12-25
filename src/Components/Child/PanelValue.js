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
            prevValue: nextProps.prevValue,
            fvalue: nextProps.fvalue
        });
    }

    render(){
        const { field, prevValue, fvalue, unit } = this.props;
        return(
            <li className="col-md-4">
                <div className="num-value">
                    <CountUp start={prevValue} end={fvalue} duration={1} decimals={2}/>
                </div>
                <p className="num-t">{field==="CO2"?<span>CO<sub>2</sub></span>:<span>{field}</span>}<span>[{unit}]</span></p>
            </li>
        )
    }
}