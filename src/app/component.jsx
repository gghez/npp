import React from 'react';

export class MyComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <span style={{ color: 'red' }}>{this.props.text}</span>;
    }
}

MyComponent.propTypes = {
    text: React.PropTypes.string
}
