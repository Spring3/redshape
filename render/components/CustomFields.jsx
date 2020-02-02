import React, { Component, Fragment } from 'react';
import { sortBy } from 'lodash';
import styled, { withTheme } from 'styled-components';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Select from 'react-select';
import HelpCircleIcon from 'mdi-react/HelpCircleIcon';
import { Input, Label } from './Input';
import Tooltip from './Tooltip';

import DatePicker from './DatePicker';

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 38px;
`;

const LabelIcon = styled.span`
  margin-left: 0.2rem;
  color: #A0A0A0;
`;

const compSelectStyles = {
  container: (base, state) => ({
    ...base, minHeight: 38, minWidth: 250, maxWidth: 250, borderColor: state.isDisabled ? '#E9E9E9' : '#A0A0A0'
  }),
  control: (base, state) => ({ ...base, borderColor: state.isDisabled ? '#E9E9E9' : '#A0A0A0' }),
};

const HelpIconStyled = styled(HelpCircleIcon)`
  padding-bottom: 1px;
`;

const HelpTooltipIcon = ({ text }) => (<LabelIcon><Tooltip text={text}><HelpIconStyled size={14} /></Tooltip></LabelIcon>);

class CustomFields extends Component {
  onFieldChangeWrapper = (name, type) => ({ target: { value } }) => {
    switch (type) {
      case 'int':
        value = value.replace(/[^-\d]/g, '');
        break;
      case 'float':
        value = value.replace(/[^-\d.]/g, '');
        break;
    }
    const { onChange } = this.props;
    onChange(name, value);
  }

  onFieldBlurWrapper = (name, type) => ({ target: { value } }) => {
    switch (type) {
      case 'int':
        value = value.length ? String(Number(value).toFixed(0)) : '';
        break;
      case 'float':
        value = value.length ? String(Number(value)) : '';
        break;
    }
    const { onChange } = this.props;
    onChange(name, value);
  }

  onFieldListChangeWrapper = (name, multiple) => (data) => {
    const { onChange } = this.props;
    let value;
    if (data) {
      value = data.value;
      if (multiple) {
        value = data.map(item => item.value);
      }
    } else if (multiple) {
      value = [];
    } else {
      value = '';
    }
    onChange(name, value);
  }

  onFieldBoolChangeWrapper = (name, initialValue) => () => { // ({ target: { value } }) => {
    const { onChange } = this.props;
    onChange(name, initialValue === 'true' ? 'false' : 'true');
  }

  onFieldDateChange = name => (date) => {
    const { onChange } = this.props;
    onChange(name, date != null ? date.toISOString().split('T')[0] : null);
  }

  render() {
    const {
      isDisabled, theme, customFieldsMap, type, fieldsData
    } = this.props;
    const fields = fieldsData[type];
    let filteredFields; // only editable fields (present in this tracker/project)
    if (customFieldsMap && fields) {
      filteredFields = fields.filter(el => customFieldsMap.hasOwnProperty(el.name));
      filteredFields = sortBy(filteredFields, ['position', 'name']);
    }

    return (filteredFields ? (
      <Fragment>
        {
          filteredFields.map((el) => {
            const {
              description, field_format: format, multiple, is_required
            } = el;
            let input;
            let value = customFieldsMap[el.name];

            switch (format) {
              case 'list': {
                if (multiple) {
                  if (value && value.length) {
                    value = value.map(item => ({
                      value: item,
                      label: item
                    }));
                  }
                } else if (value) {
                  value = {
                    value,
                    label: value
                  };
                }
                input = (
                  <Select
                    name={el.name}
                    options={el.possible_values}
                    styles={compSelectStyles}
                    value={value}
                    isMulti={el.multiple}
                    onChange={this.onFieldListChangeWrapper(el.name, multiple)}
                    isClearable={true}
                    isDisabled={isDisabled}
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
                );
              } break;
              case 'date': {
                input = (
                  <DatePicker
                    style={{ width: 250, minHeight: 38 }}
                    name="date"
                    value={value}
                    isDisabled={isDisabled}
                    onChange={this.onFieldDateChange(el.name)}
                  />
                );
              } break;
              case 'bool': { // always received string/null
                const checked = (value === 'true' || value === '1');
                input = (
                  <label>
                    <Input
                      type="checkbox"
                      checked={checked}
                      disabled={isDisabled}
                      onChange={this.onFieldBoolChangeWrapper(el.name, value)}
                    />
                    <span style={{ ...isDisabled ? { color: 'gray' } : {} }}>{el.name}</span>
                  </label>
                );
              } break;
              default: {
                // discarded type 'number' for 'int' and 'float' to recognize when is empty the input
                input = (
                  <Input
                    style={{ width: 250, minHeight: 38 }}
                    type="text"
                    name={el.name}
                    value={customFieldsMap[el.name]}
                    disabled={isDisabled}
                    onChange={this.onFieldChangeWrapper(el.name, format)}
                    onBlur={this.onFieldBlurWrapper(el.name, format)}
                  />
                );
              }
            }

            return (
              <Label key={el.id} htmlFor={el.name} label={el.name} rightOfLabel={description ? (<HelpTooltipIcon text={description} />) : undefined}>
                <FlexRow>
                  {input}
                </FlexRow>
              </Label>
            );
          })
        }
      </Fragment>
    ) : <Fragment />);
  }
}

CustomFields.propTypes = {
  fieldsData: PropTypes.shape({
    issue: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      field_format: PropTypes.string.isRequired,
      possible_values: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.string.isRequired,
        })
      ]).isRequired),
      default_value: PropTypes.string
    }).isRequired),
    time_entry: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      field_format: PropTypes.string.isRequired,
      possible_values: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.string.isRequired,
        })
      ]).isRequired),
      default_value: PropTypes.string
    }).isRequired),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  theme: PropTypes.object.isRequired,
  customFieldsMap: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
};

CustomFields.defaultProps = {
  isDisabled: false,
};

const mapStateToProps = state => ({
  fieldsData: state.fields.data,
});

export default withTheme(connect(mapStateToProps)(CustomFields));
