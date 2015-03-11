'use strict';

var ReactClickDragMixin = require('react-clickdrag-mixin');
var clamp = require('clamp');
var React = require('react');
var objectAssign = require('react/lib/Object.assign');

var KEYS = {
    UP: 38,
    DOWN: 40,
    ENTER: 13
};

var NumberEditor = React.createClass({

    mixins: [ReactClickDragMixin],

    propTypes: {
        min: React.PropTypes.number,
        max: React.PropTypes.number,
        step: React.PropTypes.number,
        stepModifier: React.PropTypes.number,
        style: React.PropTypes.object,
        decimals: React.PropTypes.number,
        initialValue: React.PropTypes.number,
        className: React.PropTypes.string,
        onValueChange: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            min: -Number.MAX_VALUE,
            max: Number.MAX_VALUE,
            step: 1,
            stepModifier: 10,
            style: {},
            decimals: 0,
            initialValue: 0,
            className: '',
            onValueChange: function() {}
        };
    },

    getInitialState: function() {
        return {
            startEditing: false,
            startDragging: false,
            wasUsingSpecialKeys: false,
            value: this.props.initialValue,
            valueStr: String(this.props.initialValue),
            dragStartValue: this.props.initialValue
        };
    },

    _changeValue: function(value) {
        // Using the formatted value converted as a number assure that value == valueStr (with the right number of decimals)
        var newVal = clamp(Number(value.toFixed(this.props.decimals)), this.props.min, this.props.max);
        var formattedValue = newVal.toFixed(this.props.decimals);

        this.setState({
            value: newVal,
            valueStr: formattedValue
        });

        this.props.onValueChange(newVal);
    },

    _getStepValue: function(e, step) {
        if(e.metaKey || e.ctrlKey)
            step /= this.props.stepModifier;
        else if(e.shiftKey)
            step *= this.props.stepModifier;

        return step;
    },

    _onKeyDown: function(e) {
        var step = this._getStepValue(e, this.props.step);

        var value = this.state.value;
        var key = e.which;

        if(key == KEYS.UP) {
            e.preventDefault();
            this._changeValue(value + step);
        }
        else if(key == KEYS.DOWN) {
            e.preventDefault();
            this._changeValue(value - step);
        }
        else if(key == KEYS.ENTER) {
            if(this.state.startEditing) {
                // stop editing + save value
                this._onBlur();
            }
            else {
                this.setState({
                    startEditing: true
                });
            }
        }
    },

    _onDoubleClick: function(e) {
        this.setState({
            startEditing: true
        });
    },

    _onChange: function(e) {
        // Update only valueStr to get the right display during editing
        this.setState({
            valueStr: e.target.value
        });
    },

    _onBlur: function(e) {
        // valueStr could have changed by _onChange, so we force to update the value
        this._changeValue(Number(this.state.valueStr));

        this.setState({
            startEditing: false
        });
    },

    _onDragStart: function(e, pos) {
        this.setState({
            startDragging: true,
            dragStartValue: this.state.value
        });
    },
    _onDragStop: function() {
        this.setState({
            startDragging: false
        });
    },
    _onDragMove: function(e, deltaPos) {
        e.preventDefault();

        // If a special key is used and wasn't use before,
        // we have to set the new Mouse Position and new Drag Start value
        var isUsingSpecialKeys = e.metaKey || e.ctrlKey || e.shiftKey;
        if(isUsingSpecialKeys != this.state.wasUsingSpecialKeys) {
            this.setMousePosition(e.clientX, e.clientY);
            this.setState({
                wasUsingSpecialKeys: isUsingSpecialKeys,
                dragStartValue: this.state.value
            });
            return;
        }


        var step = this._getStepValue(e, this.props.step);
        this._changeValue(this.state.dragStartValue + deltaPos.x * (step/2));
    },

    render: function() {
        var cursor = 'ew-resize';
        var readOnly = true;
        if(this.state.startEditing) {
            cursor = 'auto';
            readOnly = false;
        }

        if (this.isMounted()) {
          document.body.style.cursor = (this.state.startDragging) ? 'ew-resize' : 'auto';
        }

        return React.createElement('input', {
            type: 'text',
            className: this.props.className,
            readOnly: readOnly,
            value: this.state.valueStr,
            style: objectAssign(this.props.style, { cursor: cursor }),
            onKeyDown: this._onKeyDown,
            onDoubleClick: this._onDoubleClick,
            onChange: this._onChange,
            onBlur: this._onBlur
        });
    }
});

module.exports = NumberEditor;
