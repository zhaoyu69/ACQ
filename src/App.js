import React,{Component} from 'react';
import routers from './routers/router';
import { Router, Switch, Route, Link, HashRouter } from 'react-router-dom';
import { Provider } from 'mobx-react'
import './Less/index.less';

export default class App extends Component {
    render(){
        return(
            <Provider {...this.props}>
                <HashRouter>
                    <div className="root">
                        <div>
                            <Switch>
                                {routers.map((route, i) => {
                                    return <Route key={i} exact path={route.path} component={route.component}/>
                                })}
                            </Switch>
                        </div>
                    </div>
                </HashRouter>
            </Provider>
        )
    }
}