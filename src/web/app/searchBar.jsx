import React from "react";
import { browserHistory } from "react-router";

export class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.search != this.props.search && this.props.search) {
            this.input.value = this.props.search;
        }
    }

    handleSubmit(e) {
        browserHistory.push('/search/' + this.input.value);
        e.preventDefault();
    }

    render() {
        return <form onSubmit={this.handleSubmit}>
            <input type="search"
                className="form-control"
                ref={(input) => this.input = input}
                defaultValue={this.props.search} />
        </form>;
    }
}

SearchBar.propTypes = {
    search: React.PropTypes.string
};
