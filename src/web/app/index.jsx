import React from "react";
import { render } from "react-dom";
import { Router, Route, browserHistory, IndexRedirect, IndexRoute } from "react-router";
import { App } from "./layout/app.jsx";
import { Home } from "./home.jsx";
import { PackageList } from "./search/packageList.jsx"

/* eslint-disable no-unused-vars */
import Bootstrap from "bootstrap/less/bootstrap.less";
import Styles from "./main.less";
/* eslint-enable no-unused-vars */

render(
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Home} />
            <Route path="search">
                <IndexRedirect to="/" />
                <Route path=":search" component={PackageList} />
            </Route>
        </Route>
    </Router>,
    document.getElementById('app')
);
