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
                        <nav className="navbar navbar-default navbar-fixed-top">
                            <div className="container-fluid">
                                <div className="collapse navbar-collapse navbar-center" id="navbar-example">
                                    <ul className="nav navbar-nav">
                                        {routers.map(function (route, i) {
                                            return (
                                                <li key={i}>
                                                    <Link to={{pathname: route.path}}>
                                                        {route.name}
                                                    </Link>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </nav>
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