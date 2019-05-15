import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledTable = styled.table`
  position: relative;

  tbody {
    text-align: center;
    font-size: 14px;
    overflow-y: scroll;
    display: block;
    max-height: 60vh;

    tr {
      th {
        padding: 15px;
        position: sticky;
        top: 0;
        background: ${props => props.theme.bgDark};
        font-weight: 900;
        transition: color ease ${props => props.theme.transitionTime};
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
        z-index: 1;
      }

      td {
        padding: 15px;
        font-weight: 500;
        transition: background ease ${props => props.theme.transitionTime};
      }

      &:hover {
        cursor: pointer;
        
        td {
          background: ${props => props.theme.bgDark};
        }
      }
    }
  }
`;

const Table = ({ children, forwardedRef }) => (
  <StyledTable
    cellPadding={0}
    cellSpacing={0}
    width="100%"
  >
    {
      children.props.element === 'tbody'
        ? children
        : (
          <tbody ref={forwardedRef}>
            {children}
          </tbody>
        )
    }
  </StyledTable>
);

Table.propTypes = {
  children: PropTypes.node.isRequired,
  forwardedRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element)
  })
};

export default React.forwardRef((props, ref) => (
  <Table forwardedRef={ref} {...props} />
));
