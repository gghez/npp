import React from 'react';
import { SearchBar } from "./searchBar.jsx";
import { Link } from "react-router";
import { Header } from "./header.jsx";

export class App extends React.Component {
    render() {
        return <section>
            <header>
                <Header />
            </header>
            <SearchBar search={this.props.params.search} />
            <p><em>Example: <Link to="/search/neo4j">neo4j</Link></em></p>
            {this.props.children}
        </section>;
    }
}
