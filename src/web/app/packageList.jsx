import React from "react";
import { ResultItem } from "./resultItem.jsx";

export class PackageList extends React.Component {
    constructor(props) {
        super(props);

        this.state = { packages: [] };
        this.doSearch();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.params.search != this.props.params.search && this.props.params.search) {
            this.doSearch();
        }
    }

    doSearch() {
        $.ajax({
            url: `http://localhost:5001/api/search/${encodeURIComponent(this.props.params.search)}`,
            method: 'GET',
            success: (data) => {
                this.setState({ packages: data.packages })
            },
            error: (xhr, status, err) => {
                console.error('Failed to search', err);
            }
        });
    }

    render() {
        return <ul>{this.state.packages.map(p => <ResultItem key={p.name} {...p} />)}</ul>;
    }
}
