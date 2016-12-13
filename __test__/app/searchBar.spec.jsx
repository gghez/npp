import React from 'react';
import renderer from 'react-test-renderer';

import { SearchBar } from "../../src/web/app/searchBar.jsx";

test('SearchBar render input[type=search]', () => {
    const component = renderer.create(<SearchBar search="pkg" />);

    let tree = component.toJSON();

    expect(tree.type).toEqual('input');
    expect(tree.props.type).toEqual('search');
    expect(tree.props.value).toEqual('pkg');

    // ensure same result as previous test run
    expect(tree).toMatchSnapshot();
});
