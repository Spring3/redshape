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
        padding: 15px;
        font-weight: 900;
        &:hover {
          cursor: pointer;
          color: ${props => props.theme.main};
        }

        svg {
          vertical-align: middle;
        }
      }

      th.due-date {
        width: 90px;
      }

      td {
        padding: 15px;
        font-weight: 500;
      }

      &:hover {
        cursor: pointer;
        
        td {
          background: ${props => props.theme.bgLight};
        }
      }
    }
  }
`;

const Table = ({ children }) => (
  <StyledTable
    cellPadding={0}
    cellSpacing={0}
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
