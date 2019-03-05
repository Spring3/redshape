import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledInput = styled.input`
  display: block;
  width: 100%;
  border-radius: 5px;
  padding: 5px;
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

const FormGroup = styled.div`  
  h4 {
    margin-bottom: 10px;    
    color: #A4A4A4;
  }
`;

const Labeled = ({ label, htmlFor, children }) => (
  <FormGroup className="form-group">
    <h4 htmlFor={htmlFor}>{label}</h4>
    {children}
  </FormGroup>
);

Labeled.propTypes = {
  htmlFor: PropTypes.string,
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

Labeled.defaultProps = {
  htmlFor: ''
};

const Input = ({ type, placeholder, onChange, onBlur, value, id, name }) => (
  <StyledInput
    type={type}
    placeholder={placeholder}
    onChange={onChange}
    onBlur={onBlur}
    value={value}
    id={id}
    name={name}
  />
);

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  value: PropTypes.string
};

Input.defaultProps = {
  type: 'text',
  placeholder: '',
  id: '',
  name: '',
  onBlur: undefined,
  value: undefined
};

export {
  Input,
  Labeled
};

export default {
  Input,
  Labeled
};
