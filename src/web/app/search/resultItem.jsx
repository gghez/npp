import React from "react";
import moment from "moment";

const HighlightedTerm = (props) => <span className="label label-warning">{props.term}</span>;

const HighlightedTerms = (props) => {
    const rx = new RegExp(props.term, 'gi');
    let m, children = [], lastIndex = 0;
    while ((m = rx.exec(props.text))) {
        children.push(<span key={m.index}>{props.text.substring(lastIndex, m.index)}</span>);
        children.push(<HighlightedTerm term={props.term} />)
        lastIndex = m.index + props.term.length;
    }
    return <div>{children}</div>;
};

export const ResultItem = (props) =>
    <li className="list-group-item">
        <strong>
            <span className="badge">{props.score}</span>&nbsp;
            <a href={`https://www.npmjs.com/package/${props.name}`}>{props.name}</a>&nbsp;
            <span className="label label-info">{props.version}</span>
        </strong>

        <span className="label label-success pull-right">~ {moment(props.modified).fromNow()}</span>

        <p><HighlightedTerms term={props.search} text={props.description} /></p>
        <p><em>{props.keywords}</em></p>
    </li>
