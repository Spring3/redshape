import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Input = styled.input`

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

const Email = ({ placeholder, onChange, id, name }) => (
  <Input
    type="email"
    placeholder={placeholder}
    onChange={onChange}
    id={id}
    name={name}
  />
);

Email.propTypes = {
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  name: PropTypes.string
};

Email.defaultProps = {
  placeholder: 'example@domain.com',
  name: 'email',
  id: ''
};


const Password = ({ placeholder, onChange, id, name }) => (
  <Input
    type="password"
    placeholder={placeholder}
    onChange={onChange}
    id={id}
    name={name}
  />
);

Password.propTypes = {
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string
};

Password.defaultProps = {
  placeholder: 'Password',
  name: 'password',
  id: ''
};

export {
  Email,
  Labeled,
  Password
};

export default {
  Email,
  Labeled,
  Password
};
