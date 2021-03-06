import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import {find, propEq} from 'ramda';

import MODES from './modes';
import {mapCronToHourFormat} from './cron-helpers.js';

import './cron-picker.css';

import {Row} from '../../layout.jsx';

// react-select requires options to have `label` and `value` keys
const MODE_OPTIONS = MODES.map(currMode => ({
    ...currMode,
    label: currMode.name,
    value: currMode.id
}));

const rowStyle = {
    justifyContent: 'flex-start',
    verticalAlign: 'center',
    alignItems: 'center',
    marginBottom: '16px'
};

export default class CronPicker extends React.Component {
    static defaultProps = {
        initialModeId: 'FREQUENTLY'
    };

    static propTypes = {
        initialCronExpression: PropTypes.string,
        initialModeId: PropTypes.string,
        onChange: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            currentModeId: props.initialModeId
        };

        // if possible, immediately emit default expression
        const initialMode = this.getModeById(props.initialModeId);
        if (initialMode.staticCronExpression) {
            props.onChange(initialMode.staticCronExpression);
        }

        this.onModeChange = this.onModeChange.bind(this);
    }

    getModeById(id) {
        return find(propEq('id', id), MODES);
    }

    onModeChange(selectedOption) {
        const newMode = this.getModeById(selectedOption.value);
        this.setState({currentModeId: newMode.id});

        if (newMode.staticCronExpression) {
            // new expression is fixed, so emit it immediately
            this.props.onChange(newMode.staticCronExpression);
        }
    }

    render() {
        const ModeComponent = this.getModeById(this.state.currentModeId).component;
        const initialTime = mapCronToHourFormat(this.props.initialCronExpression);
        return (
            <React.Fragment>
                <Row style={rowStyle}>
                    <div style={{width: '50%', minWidth: '232px'}}>
                        <Select
                            className="mode-picker"
                            searchable={false}
                            clearable={false}
                            value={this.state.currentModeId}
                            onChange={this.onModeChange}
                            options={MODE_OPTIONS}
                        />
                    </div>
                </Row>
                {ModeComponent ? (
                    // eslint-disable-next-line
                    <ModeComponent initialTime={initialTime || undefined} onChange={this.props.onChange} />
                ) : null}
            </React.Fragment>
        );
    }
}
