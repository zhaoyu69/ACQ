import React,{Component} from 'react';

//电池-初始
function Battery_Init(){
    return(
        <div> </div>
    )
}

//电池-绿
function Battery_Green(){
    return(
        <img className="battery-img" src={require('../../Images/battery_full.png')} alt="绿色"/>
    )
}

//电池-黄
function Battery_Yellow(){
    return(
        <img className="battery-img" src={require('../../Images/battery_half.png')} alt="黄色"/>
    )
}

//电池-红
function Battery_Red(){
    return(
        <img className="battery-img" src={require('../../Images/battery_empty.png')} alt="红色"/>
    )
}

export default class GetBattery extends Component{
    constructor(props){
        super(props);
        this.state={
            battery:this.props.battery
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            battery: nextProps.battery
        });
    }

    render(){
        let Battery = this.state.battery;
        if(Battery>66){
            return <Battery_Green />
        }else if(Battery>33){
            return <Battery_Yellow />
        }else if(Battery>0){
            return <Battery_Red />
        }else{
            return <Battery_Init />
        }
    }
}