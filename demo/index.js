'use strict';

var React = require('react');
var NumberEditor = require('../');

var fs = require('fs');
var style = fs.readFileSync(__dirname+'/style.css', 'utf8');
require('insert-css')(style);


class Demo extends React.Component {
    constructor() {
        super();
        this._onNumberChange = this._onNumberChange.bind(this);

        this.state = {
            numberValue: 0
        };
    }

    _onNumberChange(value) {
        this.setState({
            numberValue: value
        });
    }

    render() {
        return (
            <div>
                <NumberEditor
                    className="spinner"
                    max={10}
                    min={0}
                    decimals={2}
                    onValueChange={this._onNumberChange}
                    step={0.1}
                    value={this.state.numberValue}
                />
                <div>Value: {this.state.numberValue}</div>
            </div>
        );
    }
}

var container = document.createElement('div');
document.body.appendChild(container);

React.render(<Demo />, container);
