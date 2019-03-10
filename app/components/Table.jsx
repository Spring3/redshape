import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledTable = styled.table`
`;

const Table = ({ children }) => (
  <StyledTable>
    <tbody>
      { children }
    </tbody>
  </StyledTable>
);

Table.propTypes = {
  children: PropTypes.node.isRequired
};

export default Table;
