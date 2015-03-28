var React = require('react');
var NumberEditor = require('../');

var fs = require('fs');
var style = fs.readFileSync(__dirname+'/style.css', 'utf8');
require('insert-css')(style);


function logValue(value) {
    console.log(value);
}


var container = document.createElement('div');
document.body.appendChild(container);


React.render(
    <NumberEditor className="spinner" min={0} max={1} step={0.01} decimals={2} onValueChange={logValue} />,
    container
);
