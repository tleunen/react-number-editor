'use strict';

var clickDrag = require('react-clickdrag');
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
        className: React.PropTypes.string,
        decimals: React.PropTypes.number,
        max: React.PropTypes.number,
        min: React.PropTypes.number,
        onValueChange: React.PropTypes.func,
        step: React.PropTypes.number,
        stepModifier: React.PropTypes.number,
        style: React.PropTypes.object,
        value: React.PropTypes.oneOfType([
          React.PropTypes.string,
          React.PropTypes.number
        ]).isRequired
    },

    getDefaultProps: function() {
        return {
            className: '',
            decimals: 0,
            max: Number.MAX_VALUE,
            min: -Number.MAX_VALUE,
            onValueChange: function() {},
            step: 1,
            stepModifier: 10,
            style: {}
        };
    },

    getInitialState: function() {
        return {
            startEditing: false,
            wasUsingSpecialKeys: false,
            dragStartValue: Number(this.props.value)
        };
    },

    componentWillReceiveProps: function(nextProps) {
        // start
        if(nextProps.dataDrag.isMouseDown && !nextProps.dataDrag.isMoving) {
            this.setState({
                dragStartValue: Number(this.props.value)
            });
        }

        if(nextProps.dataDrag.isMoving) {
            var step = this._getStepValue(nextProps.dataDrag, this.props.step);
            this._changeValue(this.state.dragStartValue + nextProps.dataDrag.moveDeltaX * (step / 2));
        }
    },


    _changeValue: function(value) {
        var newVal = clamp(value.toFixed(this.props.decimals), this.props.min, this.props.max);

        if(this.props.value !== newVal) {
            this.props.onValueChange(newVal);
        }
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

        var value = this.props.value;
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
        this.props.onValueChange(e.target.value);
    },

    _onBlur: function(e) {
        this._changeValue(Number(e.target.value));
        this.setState({
            startEditing: false
        });
    },

    render: function() {
        var cursor = 'ew-resize';
        var readOnly = true;
        var value = this.props.value;
        if(this.state.startEditing) {
            cursor = 'auto';
            readOnly = false;
        }

        if(!this.state.startEditing) {
            value = Number(value).toFixed(this.props.decimals);
        }

        return React.createElement('input', {
            type: 'text',
            className: this.props.className,
            readOnly: readOnly,
            value: value,
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
    touch: true,
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
