import React,{Component} from 'react';
import '../Less/Footer.less';

export default class Footer extends Component{
    render(){
        return(
            <div className="footer">
                <div className="container">
                    <div className="row text-center">
                        <p><img src={require("../Images/logos.png")}/></p>
                        <p className=" copyright">
                            Copyright©2017 All Right Reserved.
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}