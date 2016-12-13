import React from "react";
import {browserHistory} from "react-router";

export class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.state={search: ''};
    }

    componentDidMount(){
        this.setState({search: this.props.search});
    }

    handleChange(e) {
        this.setState({ search: e.target.value });
    }

    handleKeyPress(e) {
        if (e.key == 'Enter') {
            browserHistory.push('/search/' + this.state.search);
        }
    }

    render() {
        return <input type="search"
            onChange={this.handleChange}
            onKeyPress={this.handleKeyPress}
            value={this.state.search} />
    }
}

SearchBar.propTypes = {
    search: React.PropTypes.string
};
