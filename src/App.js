import React,{Component} from 'react';
import './Less/index.less';

import routers from './routers/router';
import history from './routers/history';
import { Router, Switch, Route, Link } from 'react-router-dom';

export default class App extends Component {
    render(){
        return(
            <Router history={history}>
                <div className="root">
                    <nav className="navbar navbar-default navbar-fixed-top">
                        <div className="container-fluid">
                            <div className="collapse navbar-collapse navbar-center" id="navbar-example">
                                <ul className="nav navbar-nav">
                                    {routers.map(function (route, i) {
                                        return (
                                            <li key={i}>
                                                <Link to={route.path}>
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
            </Router>
        )
    }
}