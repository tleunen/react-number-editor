var React = require('react');
var NumberEditor = require('react-number-editor');

React.render(
    <NumberEditor min={0} max={1} step={0.01} decimals={2} onValueChange={onValueChange} />,
    document.body
);
