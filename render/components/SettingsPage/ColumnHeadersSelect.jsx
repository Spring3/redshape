import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'react-select';
import { connect } from 'react-redux';
import makeAnimated from 'react-select/lib/animated';
import styled, { withTheme } from 'styled-components';
import HelpCircleIcon from 'mdi-react/HelpCircleIcon';
import { availableOptions } from '../../settings';

import actions from '../../actions';
import { Label } from '../Input';
import Tooltip from '../Tooltip';

const selectStyles = {
  container: (base, state) => ({ ...base }),
  multiValue: (base, state) => (state.data.isFixed
    ? { ...base, backgroundColor: '#FAFAFA', border: '1px solid #A4A4A4' }
    : { ...base, backgroundColor: 'transparent', border: '1px solid #3F3844' }),
  multiValueLabel: (base, state) => (state.data.isFixed
    ? { ...base, paddingRight: 6, color: '#A4A4A4' }
    : base),
  multiValueRemove: (base, state) => (state.data.isFixed ? { ...base, display: 'none' } : base)
};

const HelpIconStyled = styled(HelpCircleIcon)`
  padding-bottom: 1px;
`;
const LabelIcon = styled.span`
  margin-left: 0.2rem;
  color: #A0A0A0;
`;
const tooltipColumns = "'Tags', 'Total Estimation', 'Total Spent',\n'Spent', 'Subtasks' and colored 'Parent'\n need server-side support.";
const TableColumnsInfo = (<LabelIcon><Tooltip text={tooltipColumns}><HelpIconStyled size={14} /></Tooltip></LabelIcon>);

class ColumnHeadersSelect extends Component {
  constructor(props) {
    super(props);

    this.issueHeaders = availableOptions.issueHeaders;
  }

  onHeadersSelectChange = (value, { action, removedValue }) => {
    switch (action) {
      case 'remove-value':
      case 'pop-value':
        if (removedValue.isFixed) {
          return;
        }
        break;
    }

    this.props.settingsChangeIssueHeaders(value);
  }

  render() {
    const { theme, issueHeaders } = this.props;
    return (
      <Label htmlFor="headers" label="Table Columns" rightOfLabel={TableColumnsInfo}>
        <Select
          name="headers"
          styles={selectStyles}
          components={makeAnimated()}
          options={this.issueHeaders}
          defaultValue={issueHeaders}
          value={issueHeaders}
          onChange={this.onHeadersSelectChange}
          isMulti={true}
          isClearable={false}
          theme={defaultTheme => ({
            ...defaultTheme,
            borderRadius: 3,
            colors: {
              ...defaultTheme.colors,
              primary: theme.main,
            },
          })
          }
        />
      </Label>
    );
  }
}

ColumnHeadersSelect.propTypes = {
  issueHeaders: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    format: PropTypes.string,
    isFixed: PropTypes.bool
  }).isRequired).isRequired,
  settingsChangeIssueHeaders: PropTypes.func.isRequired,
  rightOfLabel: PropTypes.element,
};

const mapStateToProps = state => ({
  issueHeaders: state.settings.issueHeaders,
});

const mapDispatchToProps = dispatch => ({
  settingsChangeIssueHeaders: issueHeaders => dispatch(actions.settings.setIssueHeaders(issueHeaders))
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(ColumnHeadersSelect));
