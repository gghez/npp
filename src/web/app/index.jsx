import React from "react";
import { render } from "react-dom";
import { Router, Route, browserHistory, IndexRedirect } from "react-router";
import { App } from "./app.jsx";
import { PackageList } from "./packageList.jsx"

render(
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <Route path="search">
                <IndexRedirect to="/" />
                <Route path=":search" component={PackageList} />
            </Route>
        </Route>
    </Router>,
    document.getElementById('app')
);
