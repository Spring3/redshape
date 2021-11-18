import React, { useCallback } from 'react';
import { useTheme } from 'styled-components';
import { NavLink } from 'react-router-dom';
import { css } from '@emotion/react';
import ChevronDownIcon from 'mdi-react/ChevronDownIcon';
import ChevronUpIcon from 'mdi-react/ChevronUpIcon';

import { GhostButton } from './GhostButton';
import { useOvermindActions, useOvermindState } from '../store';
import { Flex } from './Flex';
import { Dropdown } from './Dropdown';
import { theme as Theme } from '../theme';

const styles = {
  nav: css`
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    z-index: 2;
    height: 50px;
    background: linear-gradient(to bottom, white 85%, transparent);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 1.5rem 0px 1.5rem;
  `,
  icon: css`
    vertical-align: middle;
  `
};

const Navbar = () => {
  const state = useOvermindState();
  const actions = useOvermindActions();

  const userName = `${state.users.currentUser?.firstName} ${state.users.currentUser?.lastName}`;

  const theme = useTheme() as typeof Theme;

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
      <Flex>
        <h2>My Backlog</h2>
        {/* <li>Issues</li> */}
      </Flex>
      <Flex gap="1rem">
        <NavLink
          css={[navLinkStyles, css`margin-right: 1rem`]}
          to="/app"
          activeStyle={{
            color: theme.main,
            borderBottom: `2px solid ${theme.main}`
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
