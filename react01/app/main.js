/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/react/react.d.ts" />
'use strict';

var React = require('react');
var TestOne = require('./TestOne');
var TestTwo = require('./TestTwo');

var Main = React.createClass({
  getInitialState: function () {
    return {
      switch: true
    };
  },
  _toggle() {
    this.setState({
       switch: !this.state.switch
    });
  },
  render() {
        return (
            <div>
                <input type="button" onClick={this._toggle} value="Press Me!"/>
                {this.state.switch ? <TestOne /> : <TestTwo />}
            </div>      
        );
    }
});

React.render(<Main />, document.body);
