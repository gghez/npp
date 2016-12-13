import React from 'react';
import renderer from 'react-test-renderer';

import { SearchBar } from "../../src/web/app/searchBar.jsx";

test('SearchBar render input[type=search]', () => {
    const component = renderer.create(<SearchBar search="pkg" />);

    let tree = component.toJSON();

    // ensure same result as previous test run
    expect(tree).toMatchSnapshot();

    // uncomment on future JEST release
    // expect(tree).toMatchObject({
    //     type: 'form',
    //     children: [{
    //         type: 'input',
    //         props: {
    //             type: 'search',
    //             value: 'pkg'
    //         }
    //     }]
    // });

    expect(tree.type).toEqual('form');
    expect(tree.children[0].type).toEqual('input');
    expect(tree.children[0].props.type).toEqual('search');
    expect(tree.children[0].props.defaultValue).toEqual('pkg');
});
