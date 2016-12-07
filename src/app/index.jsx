import React from 'react';
import { render } from 'react-dom';
import { MyComponent } from "./component.jsx";

class App extends React.Component {
  render() {
    return <p> Hello React! <MyComponent text="toto" /></p>;
  }
}

render(<App />, document.getElementById('app'));