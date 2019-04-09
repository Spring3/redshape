import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
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
  background: ${props => props.theme.bg};
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
      color: ${props => props.theme.normalText};

      a {
        text-decoration: none;
        color: ${props => props.theme.normalText};
      }
      
      &:hover {
        cursor: pointer;
        color: ${props => props.theme.main};

        a {
          color: ${props => props.theme.main};
        }
      }
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
            <Link to="/app" push={true}>
              Summary
            </Link>
          </li>
          <li>Issues</li>
        </ul>
        <ul>
          <li>
            <Link to="/app">
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

const mapStateToProps = state => ({
  user: state.user
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(actions.user.logout())
});

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
