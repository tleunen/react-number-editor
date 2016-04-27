import React, { PropTypes } from 'react';
import clickDrag from 'react-clickdrag';
import clamp from 'clamp';
import objectAssign from 'react/lib/Object.assign';

const KEYS = {
    UP: 38,
    DOWN: 40,
    ENTER: 13,
    BACKSPACE: 8
};

const ALLOWED_KEYS = [
    8, // Backspace
    9, // Tab
    35, // End
    36, // Home
    37, // Left Arrow
    39, // Right Arrow
    46, // Delete
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, // 0 - 9
    190, // (Dot)
    189, 173, // (Minus) - [Multiple values across different browsers]
    96, 97, 98, 99, 100, 101, 102, 103, 104, 105, // Numpad 0-9
    109, // Numpad - (Minus)
    110 // Numpad . (Decimal point)
];

class NumberEditor extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        decimals: PropTypes.number,
        max: PropTypes.number,
        min: PropTypes.number,
        onValueChange: PropTypes.func,
        step: PropTypes.number,
        stepModifier: PropTypes.number,
        style: PropTypes.object,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]).isRequired,
        onKeyDown: PropTypes.func
    };

    static defaultProps = {
        className: '',
        decimals: 0,
        max: Number.MAX_VALUE,
        min: -Number.MAX_VALUE,
        onValueChange: () => {
            // do nothing
        },
        step: 1,
        stepModifier: 10,
        style: {}
    };

    constructor(props) {
        super(props);

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onDoubleClick = this._onDoubleClick.bind(this);
        this._onChange = this._onChange.bind(this);
        this._onBlur = this._onBlur.bind(this);

        this.state = {
            startEditing: false,
            wasUsingSpecialKeys: false,
            dragStartValue: Number(props.value)
        };
    }

    componentWillReceiveProps(nextProps) {
        // start
        if(nextProps.dataDrag.isMouseDown && !nextProps.dataDrag.isMoving) {
            this.setState({
                dragStartValue: Number(this.props.value)
            });
        }

        if(nextProps.dataDrag.isMoving) {
            const step = this._getStepValue(nextProps.dataDrag, this.props.step);
            this._changeValue(this.state.dragStartValue + nextProps.dataDrag.moveDeltaX * (step / 2));
        }
    }

    _changeValue(value) {
        const newVal = clamp(value.toFixed(this.props.decimals), this.props.min, this.props.max);

        if(this.props.value !== newVal) {
            this.props.onValueChange(newVal);
        }
    }

    _getStepValue(e, step) {
        let newStep = step;
        if(e.metaKey || e.ctrlKey) {
            newStep /= this.props.stepModifier;
        }
        else if(e.shiftKey) {
            newStep *= this.props.stepModifier;
        }

        return newStep;
    }

    _onKeyDown(e) {
        const step = this._getStepValue(e, this.props.step);

        const value = Number(this.props.value);
        const key = e.which;

        if(key === KEYS.UP) {
            e.preventDefault();
            this._changeValue(value + step);
        }
        else if(key === KEYS.DOWN) {
            e.preventDefault();
            this._changeValue(value - step);
        }
        else if(key === KEYS.ENTER) {
            e.preventDefault();
            if(this.state.startEditing) {
                // stop editing + save value
                this._onBlur(e);
            }
            else {
                this.setState({
                    startEditing: true
                });
                e.target.select();
            }
        }
        else if(key === KEYS.BACKSPACE && !this.state.startEditing) {
            e.preventDefault();
        }
        else if(ALLOWED_KEYS.indexOf(key) === -1) {
            // Suppress any key we are not allowing.
            e.preventDefault();
        }

        if(this.props.onKeyDown) {
            this.props.onKeyDown(e);
        }
    }

    _onDoubleClick() {
        this.setState({
            startEditing: true
        });
    }

    _onChange(e) {
        this.props.onValueChange(e.target.value);
    }

    _onBlur(e) {
        this._changeValue(Number(e.target.value));
        this.setState({
            startEditing: false
        });
    }

    render() {
        let cursor = 'ew-resize';
        let readOnly = true;
        let value = this.props.value;
        if(this.state.startEditing) {
            cursor = 'auto';
            readOnly = false;
        }

        if(!this.state.startEditing) {
            value = Number(value).toFixed(this.props.decimals);
        }

        return (
            <input
                type="text"
                className={this.props.className}
                readOnly={readOnly}
                value={value}
                style={objectAssign(this.props.style, { cursor })}
                onKeyDown={this._onKeyDown}
                onDoubleClick={this._onDoubleClick}
                onChange={this._onChange}
                onBlur={this._onBlur}
            />
        );
    }
}

module.exports = clickDrag(NumberEditor, {
    resetOnSpecialKeys: true,
    touch: true,
    getSpecificEventData: (e) => ({
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey
    }),
    onDragMove: (e) => {
        e.preventDefault();
    }
});
