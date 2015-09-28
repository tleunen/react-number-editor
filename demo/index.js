'use strict';

var React = require('react');
var NumberEditor = require('../');

var fs = require('fs');
var style = fs.readFileSync(__dirname+'/style.css', 'utf8');
require('insert-css')(style);

var KEYS = {
    K: 75,
    M: 77
};

class Demo extends React.Component {
    constructor() {
        super();
        this._onNumberChange = this._onNumberChange.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);

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
                    max={10000}
                    min={-10}
                    decimals={2}
                    onValueChange={this._onNumberChange}
                    step={0.1}
                    value={this.state.numberValue}
                    onKeyDown={this._onKeyDown}
                    ref="demo-spinner"
                />
                <div>Value: {this.state.numberValue}</div>
                <p>This control implements onKeyDown. Pressing 'k' will multiply the value by 1,000 and pressing 'm' will multiply the value by 1,000,000.</p>
            </div>
        );
    }

    _onKeyDown(e) {
        var key = e.which;
        var value = this.state.numberValue;
        if(key === KEYS.K) {
            this._onNumberChange(value * 1000);
        } else if(key === KEYS.M) {
            this._onNumberChange(value * 1000000);
        }
    }
}

var container = document.createElement('div');
document.body.appendChild(container);

React.render(<Demo />, container);
