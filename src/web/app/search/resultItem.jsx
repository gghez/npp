import React from "react";
import moment from "moment";
import { Link } from "react-router";

export const ResultItem = (props) =>
    <li className="list-group-item">
        <strong>
            <span className="badge">{props.score}</span>&nbsp;
            <Link to={`/package/${props.name}`}>{props.name}</Link>&nbsp;
            <span className="label label-info">{props.version}</span>
        </strong>

        <span className="label label-success pull-right">~ {moment(props.modified).fromNow()}</span>

        <p>{props.description}</p>
        <p><em>{props.keywords}</em></p>
    </li>
