import React from "react";
import { render } from "react-dom";
import { Router, Route, browserHistory, IndexRedirect, IndexRoute } from "react-router";
import { App } from "./layout/app.jsx";
import { Home } from "./home.jsx";
import { PackageList } from "./search/packageList.jsx"

render(
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Home} />
            <Route path="search">
                <IndexRedirect to="/" />
                <Route path=":search" component={PackageList} />
            </Route>
            <Route path="package/:package"
        </Route>
    </Router>,
    document.getElementById('app')
);
