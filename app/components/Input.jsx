import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledInput = styled.input`
  display: block;
  width: 100%;
  border-radius: 5px;
  padding: 5px 10px;
  box-sizing: border-box;
  font-size: 14px;
  border: 1px solid #FF7079;
  min-height: 35px;
  outline: none;
  color: #FF7079;
  font-weight: bold;
  background: #FAFAFA;

  &:hover {
    border: 1px solid #FF7079;
  }

  &:focus {
    box-shadow: 0px 0px 0px 1px #FF7079;
  }
`;

const StyledCheckbox = styled.input`
`;

const FormGroup = styled.div`  
  h4 {
    margin-bottom: 10px;    
    color: #A4A4A4;
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

const Input = ({ type, checked, placeholder, onChange, onBlur, value, id, name, disabled }) => {
  if (type.toLowerCase() === 'checkbox') {
    return (
      <StyledCheckbox
        type={type}
        onChange={onChange}
        onBlur={onBlur}
        checked={checked}
        disabled={disabled}
        id={id}
        name={name}
      />
    );
  }
  return (
    <StyledInput
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      value={value}
      id={id}
      name={name}
    />
  );
};

Input.propTypes = {
  type: PropTypes.oneOf(['email', 'password', 'text', 'checkbox']),
  placeholder: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  onBlur: PropTypes.func,
  value: PropTypes.string,
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
