import React from "react";
import { render } from "react-dom";
import { Router, Route, browserHistory, IndexRedirect, IndexRoute, Redirect } from "react-router";
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
        </Route>
    </Router>,
    document.getElementById('app')
);
