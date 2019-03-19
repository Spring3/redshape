import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledTable = styled.table`
  tbody {
    text-align: center;
    font-size: 14px;
    overflow-y: scroll;
    display: block;
    max-height: 450px;

    tr {
      th {
        padding: 5px;
        border: 2px solid transparent;
        background: white;
        
        &:hover {
          cursor: pointer;
          background: #FF7079;
          color: white;
        }

        svg {
          vertical-align: middle;
        }
      }

      th:last-child {
        width: 90px;
      }

      &:hover {
        cursor: pointer;
        
        td {
          background: #FF7079;
          color: white;
        }
      }
    }

    tr:nth-child(even) {
      background: #F2F2F2;
    }
  }
`;

const Table = ({ children }) => (
  <StyledTable
    cellPadding={10}
    width="100%"
  >
    <tbody>
      { children }
    </tbody>
  </StyledTable>
);

Table.propTypes = {
  children: PropTypes.node.isRequired
};

export default Table;
