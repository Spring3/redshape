import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import { connect } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

import actions from '../actions';
import { GhostButton } from './Button';

const Navbar = styled.nav`
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  z-index: 2;
  height: 50px;
  background: linear-gradient(to bottom, ${(props) => props.theme.bg} 85%, transparent);
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

class NavigationBar extends Component {
  signout = () => {
    const { logout } = this.props;
    logout();
  }

  render() {
    const { user = {} } = this.props;
    const { name } = user;
    return (
      <Navbar>
        <ul>
          <li>
            <NavLink to="/app/summary">
              Summary
            </NavLink>
          </li>
          {/* <li>Issues</li> */}
        </ul>
        <ul>
          <li>
            <Link to="/app/summary">
              {name}
            </Link>
          </li>
          <li>
            <GhostButton
              id="signout"
              onClick={this.signout}
            >
              Sign out
            </GhostButton>
          </li>
        </ul>
      </Navbar>
    );
  }
}

NavigationBar.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    name: PropTypes.string.isRequired,
    api_key: PropTypes.string.isRequired,
    redmineEndpoint: PropTypes.string.isRequired
  }).isRequired,
  logout: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  user: state.user
});

const mapDispatchToProps = (dispatch) => ({
  logout: () => dispatch(actions.user.logout())
});

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
