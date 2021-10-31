import React from 'react';
import styled, { css } from 'styled-components';
import { Link, NavLink } from 'react-router-dom';

import { GhostButton } from './Button';
import { useOvermindActions, useOvermindState } from '../store';

const StyledNavbar = styled.nav`
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  z-index: 2;
  height: 50px;
  background: linear-gradient(to bottom, ${props => props.theme.bg} 85%, transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px 0px 40px;

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;

    li {
      display: inline;
      font-size: 15px;
      font-weight: bold;
      ${({ theme }) => css`
        color: ${theme.normalText};
        transition: color ease ${theme.transitionTime};

        a {
          text-decoration: none;
          color: ${theme.normalText};
          transition: color ease ${theme.transitionTime};
          padding-bottom: 5px;
        }

        a.active {
          color: ${theme.main};
          border-bottom: 2px solid ${theme.main};
        }

        &:hover {
          cursor: pointer;
          color: ${theme.main};

          a {
            color: ${theme.main};
          }
        }
      `}
    }
  }

  ul:first-child {
    li {
      margin: 0px 20px;
    }

    li:first-child {
      margin-left: 0;
    }
  }

  ul:last-child {
    li {
      margin: 0px 20px;
    }

    li:last-child {
      margin-right: 0px;
    }
  }
`;

const Navbar = () => {
  const state = useOvermindState();
  const actions = useOvermindActions();

  const userName = `${state.users.currentUser?.firstName} ${state.users.currentUser?.lastName}`;

  return (
    <StyledNavbar>
      <ul>
        <li>
          <NavLink to="/app/summary">Summary</NavLink>
        </li>
        {/* <li>Issues</li> */}
      </ul>
      <ul>
        <li>
          <Link to="/app/summary">{userName}</Link>
        </li>
        <li>
          <GhostButton id="signout" onClick={actions.users.logout}>
            Sign out
          </GhostButton>
        </li>
      </ul>
    </StyledNavbar>
  );
};

export {
  Navbar
};
