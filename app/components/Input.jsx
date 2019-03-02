import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const TextInput = styled.input`

`;

const Labeled = ({ label, htmlFor, children }) => (
  <div className="form-group">
    <label htmlFor={htmlFor}>{label}</label>
    {children}
  </div>
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
  <TextInput
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
