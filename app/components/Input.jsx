import React, { PureComponent } from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import CheckIcon from 'mdi-react/CheckIcon';

const StyledInput = styled.input`
  display: block;
  width: 100%;
  border-radius: 3px;
  padding: 5px 10px;
  box-sizing: border-box;
  font-size: 14px;
  min-height: 35px;
  outline: none;
  font-weight: bold;
  
  ${({ theme }) => css`
    border: 1px solid ${theme.minorText};
    color: ${theme.main};
    background: white;

    &:hover {
      border: 1px solid ${theme.main};
    }

    &:focus {
      border-color: ${theme.main};
      box-shadow: 0px 0px 0px 1px ${theme.main};
    }

    &::placeholder {
      color: ${theme.minorText};
    }
  `}}
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const checkedStyles = css`
  background: #FF7079;
`
const uncheckedStyles = css`
  background: white;
`

const disabledStyles = css`
 background: grey;
`

const StyledCheckbox = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  background: ${props => props.checked ? 'salmon' : 'papayawhip'}
  border-radius: 3px;
  transition: all 150ms;

  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px pink;
  }

  svg {
    visibility: ${props => props.checked ? 'visible' : 'hidden'};
    vertical-align: middle;
  }

  ${props => props.checked ? checkedStyles : uncheckedStyles};

  ${props => props.disabled ? disabledStyles : null};
`

const CheckboxContainer = styled.div`
  display: inline-block;
  vertical-align: middle;
`

const FormGroup = styled.div`  
  h4 {
    margin-bottom: 10px;    
    color: ${props => props.theme.minorText};
  }
`;

const Label = ({ label, htmlFor, children, className, inline, rightToLeft }) => ( 
  <FormGroup className={`form-group ${className}`}>
    { rightToLeft === true && (children) }
    { inline === false
      ? (
        <h4 htmlFor={htmlFor}>{label}</h4>
      )
      : (
        <label htmlFor={htmlFor}>{label}</label>
      )
    }
    { rightToLeft === false && (children) }
  </FormGroup>
);

Label.propTypes = {
  htmlFor: PropTypes.string,
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  inline: PropTypes.bool,
  rightToLeft: PropTypes.bool
};

Label.defaultProps = {
  htmlFor: '',
  className: undefined,
  inline: false,
  rightToLeft: false
};

class Input extends PureComponent {
  ensureNumber = (value) => {
    if (typeof value === 'string') {
      if (/,|./.test(value)) {
        return parseFloat(value.replace(',', '.'));
      }
      return parseInt(value, 10);
    }
    return value;
  }

  render() {
    const { type, checked, className, placeholder, onChange, onBlur, value, id, name, disabled } = this.props;
    return type.toLowerCase() === 'checkbox'
      ? (
        <CheckboxContainer className={className}>
          <HiddenCheckbox
            onChange={onChange}
            onBlur={onBlur}
            checked={checked}
            disabled={disabled}
            id={id}
            name={name}
          />
          <StyledCheckbox checked={checked}>
            <CheckIcon />
          </StyledCheckbox>
        </CheckboxContainer>
      )
      : (
        <StyledInput
          type={type}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          value={type === 'number' ? this.ensureNumber(value) : value}
          id={id}
          name={name}
        />
      );
  }
}

Input.propTypes = {
  type: PropTypes.oneOf(['email', 'password', 'text', 'checkbox', 'number']),
  placeholder: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  onBlur: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  checked: (props, propName, componentName) => { // eslint-disable-line
    if (props.type === 'checkbox' && typeof props[propName] !== 'boolean') {
      return new Error(`${propName} is maked as required for component ${componentName} type checkbox, but it's value is not boolean`);
    }
  }
};

Input.defaultProps = {
  type: 'text',
  placeholder: undefined,
  id: undefined,
  disabled: false,
  name: undefined,
  onBlur: undefined,
  value: undefined,
  checked: false
};

export {
  Input,
  Label
};

export default {
  Input,
  Label
};
