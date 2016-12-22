import React from "react";
import moment from "moment";

export const ResultItem = (props) =>
    <li className="list-group-item">
        <strong>
            <span className="badge">{props.score}</span>&nbsp;
            <a href={`https://www.npmjs.com/package/${props.name}`}>{props.name}</a>&nbsp;
            <span className="label label-info">{props.version}</span>
        </strong>

        <span className="label label-success pull-right">~ {moment(props.modified).fromNow()}</span>

        <HighlightedText term={props.search} text={props.description} />
        <p><em>{props.keywords}</em></p>
    </li>

const HighlightedText = (props) => {
    const {term, text} = props;
    const rx = new RegExp(term, 'gi');

    let m, children = [], lastIndex = 0;
    while ((m = rx.exec(text))) {
        children = [
            ...children,
            <span key={m.index - 1}>{props.text.substring(lastIndex, m.index)}</span>,
            <strong className="npp-highlighted" key={m.index}>{m[0]}</strong>
        ];
        lastIndex = m.index + props.term.length;
    }

    children = [...children, <span key={lastIndex}>{props.text.substr(lastIndex)}</span>];

    return <div>{children}</div>;
};

