'use strict';

var clickDrag = require('react-clickdrag')
var clamp = require('clamp');
var React = require('react');
var objectAssign = require('react/lib/Object.assign');

var KEYS = {
    UP: 38,
    DOWN: 40,
    ENTER: 13
};

var NumberEditor = React.createClass({
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
            wasUsingSpecialKeys: false,
            value: this.props.initialValue,
            valueStr: String(this.props.initialValue),
            dragStartValue: this.props.initialValue
        };
    },

    componentWillReceiveProps: function(nextProps) {
        // start
        if(nextProps.dataDrag.isMouseDown && !nextProps.dataDrag.isMoving) {
            this.setState({
                dragStartValue: this.state.value
            });
        }

        if(nextProps.dataDrag.isMoving) {
            var step = this._getStepValue(nextProps.dataDrag, this.props.step);
            this._changeValue(this.state.dragStartValue + nextProps.dataDrag.moveDeltaX * (step/2));
        }

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
        if(e.metaKey || e.ctrlKey) {
            step /= this.props.stepModifier;
        }
        else if(e.shiftKey) {
            step *= this.props.stepModifier;
        }

        return step;
    },

    _onKeyDown: function(e) {
        var step = this._getStepValue(e, this.props.step);

        var value = this.state.value;
        var key = e.which;

        if(key === KEYS.UP) {
            e.preventDefault();
            this._changeValue(value + step);
        }
        else if(key === KEYS.DOWN) {
            e.preventDefault();
            this._changeValue(value - step);
        }
        else if(key === KEYS.ENTER) {
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

    _onDoubleClick: function(/*e*/) {
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

    _onBlur: function(/*e*/) {
        // valueStr could have changed by _onChange, so we force to update the value
        this._changeValue(Number(this.state.valueStr));

        this.setState({
            startEditing: false
        });
    },

    render: function() {
        var cursor = 'ew-resize';
        var readOnly = true;
        if(this.state.startEditing) {
            cursor = 'auto';
            readOnly = false;
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

module.exports = clickDrag(NumberEditor, {
    resetOnSpecialKeys: true,
    getSpecificEventData: function(e) {
        return {
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey
        };
    },
    onDragMove: function(e) {
        e.preventDefault();
    }
});
