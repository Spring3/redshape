import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledTextArea = styled.textarea`
  font-size: 14px;
  resize: none;
  overflow: hidden;
  height: auto;
  font-family: inherit;
  width: 100%;
  line-height: 1.5rem;
  box-sizing: border-box;
`;

const TextArea = ({
  name,
  onChange,
  rows,
  disabled,
  id,
  value,
  className,
  forwardedRef,
  onKeyDown
}) => (
  <StyledTextArea
    ref={forwardedRef}
    name={name}
    onChange={onChange}
    rows={rows}
    disabled={disabled}
    id={id}
    className={className}
    value={value}
    onKeyDown={onKeyDown}
  />
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
  value: PropTypes.string,
  forwardedRef: PropTypes.object,
  onKeyDown: PropTypes.func
};

TextArea.defaultProps = {
  name: undefined,
  rows: 1,
  disabled: false,
  id: undefined,
  className: undefined,
  value: undefined,
  forwardedRef: undefined
};

export default React.forwardRef((props, ref) => <TextArea forwardedRef={ref} {...props} />);
