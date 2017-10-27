import React from 'react';
import PropTypes from 'prop-types';
import clickDrag from 'react-clickdrag';
import clamp from 'clamp';

const KEYS = {
    UP: 38,
    DOWN: 40,
    ENTER: 13,
    BACKSPACE: 8,
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
    110, // Numpad . (Decimal point)
];

const propTypes = {
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
        PropTypes.number,
    ]).isRequired,
    onKeyDown: PropTypes.func,
};

const defaultProps = {
    className: '',
    decimals: 0,
    max: Number.MAX_VALUE,
    min: -Number.MAX_VALUE,
    onValueChange: () => {
        // do nothing
    },
    step: 1,
    stepModifier: 10,
    style: {},
};

class NumberEditor extends React.Component {
    constructor(props) {
        super(props);

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onDoubleClick = this.onDoubleClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);

        this.state = {
            startEditing: false,
            wasUsingSpecialKeys: false,
            dragStartValue: Number(props.value),
        };
    }

    componentWillReceiveProps(nextProps) {
        // start
        if (nextProps.dataDrag.isMouseDown && !nextProps.dataDrag.isMoving) {
            this.setState({
                dragStartValue: Number(this.props.value),
            });
        }

        if (nextProps.dataDrag.isMoving) {
            const step = this.getStepValue(nextProps.dataDrag, this.props.step);
            this.changeValue(this.state.dragStartValue + (nextProps.dataDrag.moveDeltaX * (step / 2)));
        }
    }

    onDoubleClick() {
        this.setState({
            startEditing: true,
        });
    }

    onChange(e) {
        this.props.onValueChange(e.target.value);
    }

    onBlur(e) {
        this.changeValue(Number(e.target.value));
        this.setState({
            startEditing: false,
        });
    }

    onKeyDown(e) {
        const step = this.getStepValue(e, this.props.step);

        const value = Number(this.props.value);
        const key = e.which;

        if (key === KEYS.UP) {
            e.preventDefault();
            this.changeValue(value + step);
        } else if (key === KEYS.DOWN) {
            e.preventDefault();
            this.changeValue(value - step);
        } else if (key === KEYS.ENTER) {
            e.preventDefault();
            if (this.state.startEditing) {
                // stop editing + save value
                this.onBlur(e);
            } else {
                this.setState({
                    startEditing: true,
                });
                e.target.select();
            }
        } else if (key === KEYS.BACKSPACE && !this.state.startEditing) {
            e.preventDefault();
        } else if (ALLOWED_KEYS.indexOf(key) === -1) {
            // Suppress any key we are not allowing.
            e.preventDefault();
        }

        if (this.props.onKeyDown) {
            this.props.onKeyDown(e);
        }
    }

    getStepValue(e, step) {
        let newStep = step;
        if (e.metaKey || e.ctrlKey) {
            newStep /= this.props.stepModifier;
        } else if (e.shiftKey) {
            newStep *= this.props.stepModifier;
        }

        return newStep;
    }

    changeValue(value) {
        const newVal = clamp(value.toFixed(this.props.decimals), this.props.min, this.props.max);

        if (Number(this.props.value) !== Number(newVal)) {
            this.props.onValueChange(newVal);
        }
    }

    render() {
        let cursor = 'ew-resize';
        let readOnly = true;
        let value = this.props.value;
        if (this.state.startEditing) {
            cursor = 'auto';
            readOnly = false;
        }

        if (!this.state.startEditing) {
            value = Number(value).toFixed(this.props.decimals);
        }

        return (
            <input
                type="text"
                className={this.props.className}
                readOnly={readOnly}
                value={value}
                style={{ ...this.props.style, cursor }}
                onKeyDown={this.onKeyDown}
                onDoubleClick={this.onDoubleClick}
                onChange={this.onChange}
                onBlur={this.onBlur}
            />
        );
    }
}

NumberEditor.propTypes = propTypes;
NumberEditor.defaultProps = defaultProps;

export default clickDrag(NumberEditor, {
    resetOnSpecialKeys: true,
    touch: true,
    getSpecificEventData: e => ({
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
    }),
    onDragMove: (e) => {
        e.preventDefault();
    },
});
