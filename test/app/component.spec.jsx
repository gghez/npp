import React from 'react';
import renderer from 'react-test-renderer';

import { MyComponent } from "../../src/app/component.jsx";

test('MyComponent render text properly', () => {
    const component = renderer.create(<MyComponent text="toto" />);

    let tree = component.toJSON();

    expect(tree.type).toEqual('span');
    expect(tree.props.style.color).toEqual('red');
    expect(tree.children[0]).toEqual('toto');

    // ensure same result as previous test run
    expect(tree).toMatchSnapshot();
});