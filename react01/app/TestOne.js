/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/react/react.d.ts" />
'use strict';

var React = require('react');

var TestOne = React.createClass({
    render() {
        return (
            <div>Hello I am TestOne Component</div>
        );
    }
});

module.exports = TestOne;