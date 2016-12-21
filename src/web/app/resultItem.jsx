import React from "react";
import moment from "moment";

export class ResultItem extends React.Component {
    lastUpdate() {
        return moment(this.props.modified).fromNow();
    }

    render() {
        return <li className="list-group-item">

            <strong><span className="badge">{this.props.score}</span> {this.props.name} <span className="label label-info">{this.props.version}</span></strong>

            <span className="label label-success pull-right">~ {this.lastUpdate()}</span>

            <p>{this.props.description}</p>
            <p><em>{this.props.keywords}</em></p>
        </li>;
    }
}
