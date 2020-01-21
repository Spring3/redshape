import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import { connect } from 'react-redux';
import {Link, NavLink, withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';

import actions from '../actions';
import { GhostButton } from './Button';

import { animationSlideRight } from '../animations';
import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon';
import LogoutIcon from 'mdi-react/LogoutIcon';
import GearIcon from 'mdi-react/GearIcon';
import ListIcon from 'mdi-react/ViewListIcon';

import Modal from "./Modal";
import AboutPage from "../about/AboutPage";

const Name = styled.span`
  color: ${props => props.theme.main};
  align-self: flex-end;
`;

const Bubble = styled.div`
  .Label {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    font-size: 18px;
    color: #fff;
    background-color: ${props => props.theme.main};
    text-align: center;
    line-height: 38px;
    font-weight: bold;
  }
  .Drop ul{
      padding: 0;
      list-style: none;
  }

  .Drop ul li{
      display: inline-block;
      position: relative;
      line-height: 21px;
      text-align: left;
  }

  .Drop ul.dropdown{
      background: white;
      position: absolute;
      z-index: 999;
      visibility: hidden;
      opacity: 0;
      overflow: hidden;
      height: 0;
      
      right: 30px;
      margin-left: -150px;
      margin-top: 16px;
      height: 150px;
      border: 2px solid ${props => props.theme.main};
      
      display: flex;
      flex-direction: column;
      transition: height 0.8s ease-out, opacity 300ms;
      -webkit-transition: height 0.8s ease-out, opacity 300ms;
      border-radius: 0 0 5px 5px;
  }

  .Drop:hover ul.dropdown{
      overflow: initial;
      visibility: visible;
      opacity: 1;
      height: auto;
  }

  .Drop ul.dropdown li{
      display: block;
      margin: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 40px;
      margin: 0 30px;
      &:nth-child(2) {
        height: 60px;
      }
  }
  .Drop ul.dropdown li.name {
    align-self: flex-end;
  }
  .Drop ul.dropdown li.dropdown-ghost{
    height: 40px;
    position: absolute;
    width: 100%;
    top: -40px;
    margin: 0;
    
    &::after {
      content: ' ';
      position: absolute;
      // width: auto;    
      border: 2px solid ${props => props.theme.main};
      border-width: 12px;
      border-color: ${props => props.theme.main} transparent transparent transparent;
      transform: rotate(180deg);
      right: 14px;
      bottom: 0;
    }
  }
`;

const Navbar = styled.nav`
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  z-index: 2;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${props => props.isEnhanced ? css`
    padding: 10px 40px;
    background: white;
    border-bottom: 2px solid ${props.theme.main};
  ` : css`
    padding: 20px 40px 0px 40px;
    background: linear-gradient(to bottom, ${props => props.theme.bg} 85%, transparent);
  `}

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
      ${({theme}) => css`
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
          a {
            cursor: pointer;
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

  ${props => (!props.isEnhanced) && css`
  ul:last-child {
    li {
      margin: 0px 20px;
    }

    li:last-child {
      margin-right: 0px;
    }
  }
  `}
`;

const IconButton = styled(GhostButton)`
  svg {
    border-radius: 3px;
    ${({theme}) => css`
      color: ${theme.main};
      border: 2px solid transparent;
      transition: all ease ${theme.transitionTime};

      &:hover {
        color: ${theme.main};
        border: 2px solid ${theme.main};
      }
    `}
  }
`;

const BackButton = styled(IconButton)`
  svg {
    animation: ${animationSlideRight} 2s ease-in infinite;
    &:hover {
      animation-play-state: paused;
    }
  }
`;

class NavigationBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpenAbout: false
    };
  }

  signout = () => {
    const { logout } = this.props;
    logout();
  }

  render() {
    const { user = {}, uiStyle, history } = this.props;
    const { name } = user;
    const isEnhanced = uiStyle === 'enhanced';
    return (
      <Navbar isEnhanced={isEnhanced}>
        <ul>
          <li>
            { isEnhanced ? (
              <IconButton onClick={() => history.goBack()}>
                <ArrowLeftIcon size={30} />
              </IconButton>
            ) : (
              <BackButton onClick={() => history.goBack()}>
                <ArrowLeftIcon size={30} />
              </BackButton>
            )}
          </li>
          <li>
            <NavLink to="/app/summary">
              { isEnhanced && (<ListIcon size={18} style={{marginTop:-2,marginRight:2}}/>)}
              Summary
            </NavLink>
          </li>
        </ul>
        { isEnhanced ? (
          <Bubble>
            <div className="Drop">
              <div className="Label">R</div>
              <ul className="dropdown">
                <li className="dropdown-ghost"></li>
                <li>
                  <NavLink to="/app/settings">
                    { isEnhanced && (<GearIcon size={18} style={{marginTop:-2,marginRight:2}}/>)}
                    Settings
                  </NavLink>
                </li>
                <li>
                  <GhostButton onClick={() => this.setState({isOpenAbout: true})}>About Redshape</GhostButton>
                </li>
                <li>
                  <Name>{name}</Name>
                </li>
                <li>
                  <GhostButton
                    id="signout"
                    onClick={this.signout}
                  >
                    {isEnhanced && (<LogoutIcon size={18} style={{marginTop:-2,marginRight:2}}/>)}
                    Sign out
                  </GhostButton>
                </li>
              </ul>
            </div>
          </Bubble>
          ) : (
          <ul>
            <li>
              <NavLink to="/app/settings">
                { isEnhanced && (<GearIcon size={18} style={{marginTop:-2,marginRight:2}}/>)}
                Settings
              </NavLink>
            </li>
            <li>
              <Name>{name}</Name>
            </li>
            <li>
              <GhostButton
                id="signout"
                onClick={this.signout}
              >
                {isEnhanced && (<LogoutIcon size={18} style={{marginTop:-2,marginRight:2}}/>)}
                Sign out
              </GhostButton>
            </li>
          </ul>
        )}
        <Modal
          open={!!this.state.isOpenAbout}
          onClose={() => this.setState({ isOpenAbout: false})}
          center={true}
        >
          <AboutPage modal={true}></AboutPage>
        </Modal>
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
  logout: PropTypes.func.isRequired,
  uiStyle: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
  user: state.user,
  uiStyle: state.settings.uiStyle,
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(actions.user.logout())
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NavigationBar));
