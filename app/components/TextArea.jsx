import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledTextArea = styled.textarea`
  font-size: 14px;
  font-family: inherit;
`;

const TextArea = ({
  name,
  onChange,
  rows,
  disabled,
  id,
  value,
  className
}) => (
  <StyledTextArea
    name={name}
    onChange={onChange}
    rows={rows}
    disabled={disabled}
    id={id}
    className={className}
  >
    {value}
  </StyledTextArea>
);

TextArea.propTypes = {
  name: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  onChange: PropTypes.func.isRequired,
  rows: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  disabled: PropTypes.bool,
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  className: PropTypes.string,
  value: PropTypes.string
};

TextArea.defaultProps = {
  name: undefined,
  rows: 2,
  disabled: false,
  id: undefined,
  className: undefined,
  value: undefined
};

export default TextArea;
