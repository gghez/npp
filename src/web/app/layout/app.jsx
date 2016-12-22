import React from 'react';
import { Link } from "react-router";
import { SearchBar } from "./searchBar.jsx";
import { Header } from "./header.jsx";

export const App = (props) =>
    <section>
        <header>
            <Header />
        </header>
        <section className="container">
            <SearchBar search={props.params.search} />
            <p><em>Example: <Link to="/search/neo4j">neo4j</Link></em></p>
            {props.children}
        </section>
    </section>
