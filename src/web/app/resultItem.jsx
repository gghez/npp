import React from "react";
import moment from "moment";

export const ResultItem = (props) =>
    <li className="list-group-item">

        <strong><span className="badge">{props.score}</span> {props.name} <span className="label label-info">{props.version}</span></strong>

        <span className="label label-success pull-right">~ {moment(props.modified).fromNow()}</span>

        <p>{props.description}</p>
        <p><em>{props.keywords}</em></p>
    </li>
