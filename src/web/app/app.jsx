import React from 'react';
import { SearchBar } from "./searchBar.jsx";
import { Link } from "react-router";

export class App extends React.Component {
    render() {
        return <section>
            <p>Example: <Link to="/search/neo4j">neo4j</Link></p>
            <SearchBar search={this.props.params.search} />
            {this.props.children}
        </section>;
    }
}
