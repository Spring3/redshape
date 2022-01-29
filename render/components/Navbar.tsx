import React, { useCallback } from 'react';
import { useTheme } from 'styled-components';
import { NavLink, useMatch } from 'react-router-dom';
import { css } from '@emotion/react';
import ChevronDownIcon from 'mdi-react/ChevronDownIcon';
import ChevronUpIcon from 'mdi-react/ChevronUpIcon';

import { GhostButton } from './GhostButton';
import { useOvermindActions, useOvermindState } from '../store';
import { Flex } from './Flex';
import { Dropdown } from './Dropdown';
import { theme as Theme } from '../theme';
import { useNavbar } from '../contexts/NavbarContext';
import { BackButton } from './BackButton';

const styles = {
  nav: css`
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    z-index: 2;
    height: 50px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0px 0px 5px 0px lightgrey;
    padding: 20px 1.5rem 10px 1.5rem;
  `,
  icon: css`
    vertical-align: middle;
  `
};

const Navbar = () => {
  const navbarState = useNavbar();
  const state = useOvermindState();
  const actions = useOvermindActions();

  const userName = `${state.users.currentUser?.firstName} ${state.users.currentUser?.lastName}`;

  const theme = useTheme() as typeof Theme;

  const isIssuesPage = Boolean(useMatch('/issues/'));

  const navLinkStyles = css`
    font-size: 1rem;
    text-decoration: none;
    font-weight: semibold;
    border-bottom: 2px solid transparent;
    color: ${theme.normalText};
    transition: color ease ${theme.transitionTime};
    padding-bottom: 5px;

    &:active {
      color: ${theme.main};
    }

    &:hover {
      cursor: pointer;
      color: ${theme.main};
      border-bottom: 2px solid ${theme.main};
    }
  `;

  const getDropdownToggleElement = useCallback(({ toggle, isOpen }) => (
    <a css={navLinkStyles} onClick={toggle} href="#">
      {userName}
      {' '}
      {isOpen ? <ChevronUpIcon size={20} css={styles.icon} /> : <ChevronDownIcon size={20} css={styles.icon} />}
    </a>
  ), []);

  return (
    <nav css={styles.nav}>
      <Flex alignItems="center">
        {!isIssuesPage ? <BackButton /> : null}
        <h2>{navbarState.title}</h2>
      </Flex>
      <Flex gap="1rem">
        <NavLink
          css={[navLinkStyles, css`margin-right: 1rem`]}
          to="/issues"
          style={({ isActive }) => {
            if (isActive) {
              return ({
                color: theme.main,
                borderBottom: `2px solid ${theme.main}`
              });
            }
            return {};
          }}
        >
          Backlog

        </NavLink>
        <Dropdown getDropdownToggleElement={getDropdownToggleElement}>
          <GhostButton fullWidth id="signout" onClick={actions.users.logout}>
            Sign out
          </GhostButton>
        </Dropdown>
      </Flex>
    </nav>
  );
};

export {
  Navbar
};
