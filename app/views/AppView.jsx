import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Route, withRouter } from 'react-router-dom';
import MenuIcon from 'mdi-react/MenuIcon';
import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon';

import actions from '../actions';
import { Input } from '../components/Input';
import Button, { GhostButton } from '../components/Button';
import SummaryPage from './AppViewPages/SummaryPage';

const Grid = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: 60px auto;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
`;

const Navbar = styled.nav`
  border-top: 3px solid #FF7079;
  grid-row: 1;
  grid-column: span 12;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 20px;
`;

const Aside = styled.aside`
  display: ${props => props.show ? 'block' : 'none'};
  background: tomato;
  grid-row: 1 / -1;
  grid-column: span 3;
  padding-top: 25px;
`;

const ActiveTimer = styled.div`
  display: ${props => props.show ? 'block' : 'none'};
  background: sandybrown;
`;

const Content = styled.div`
  background: aliceblue;
  grid-column: span 12;
  grid-row: 2 / -1;
`;

const MenuList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;

  li {
    display: inline;
    margin: 0px 10px;
    font-size: 14px;

    &:hover {
      cursor: pointer;
    }
  }

  li:first-child {
    margin-left: 0;
  }
`;

const Profile = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;

  li {
    display: inline;
  }

  li:first-child {
    margin-right: 10px;
  }
`;

const SignOutButton = styled(Button)`
  margin: 0;
  padding: 5px;
  font-size: 14px;
`;

const Hamburger = styled.li`
  && {
    display: ${props => props.show ? 'initial' : 'none'};
  }
  padding: 0px;
  margin: 0px;

  svg {
    vertical-align: middle;
  }
`

class AppView extends Component {
  constructor(props) {
    super(props);

    if (!props.user.id) {
      props.history.push('/');
    }

    this.state = {
      showSidebar: false,
      showFooter: false
    };
  }

  toggleSidebar = () => {
    const { showSidebar } = this.state;
    this.setState({
      showSidebar: !showSidebar
    });
  };

  signout = () => {
    const { logout, history } = this.props;
    logout();
    history.push('/');
  }

  render() {
    const { showSidebar, showFooter } = this.state;
    const { user = {} } = this.props;
    const { firstname, lastname } = user;
    return (
      <Grid>
        <Aside show={showSidebar}>
          <div>
            <GhostButton onClick={this.toggleSidebar}><ArrowLeftIcon /></GhostButton>
            <h4>Time Log History</h4>
          </div>
          <div>
            <Input
              type="text"
              placeholder="search"
              onChange={() => {}}
            />
          </div>
          <ul>
            <li>
              <span>Entry Name</span>
              <span>1.0 hours</span>
              <span>1 day(s) ago</span>
              <button>Edit</button>
            </li>
            <li>
              <span>Entry Name</span>
              <span>1.5 hours</span>
              <span>1 day(s) ago</span>
              <button>Edit</button>
            </li>
            <li>
              <span>Entry Name</span>
              <span>1.3 hours</span>
              <span>3 day(s) ago</span>
              <button>Edit</button>
            </li>
          </ul>
        </Aside>
        <Navbar>
          <MenuList>
            <Hamburger show={!showSidebar}>
              <GhostButton onClick={this.toggleSidebar}>
                <MenuIcon />
              </GhostButton>
            </Hamburger>
            <li>My Page</li>
            <li>Time</li>
            <li>Issues</li>
          </MenuList>
          <Profile>
            <li>{firstname} {lastname}</li>
            <li><SignOutButton onClick={this.signout}>Sign out</SignOutButton></li>
          </Profile>
        </Navbar>
        <Content>
          <Route path="/time" />
          <Route path="/" component={SummaryPage} />
          <ActiveTimer show={showFooter}>
            <span>Task name</span>
            <span>00:00:00</span>
            <button>Stop</button>
          </ActiveTimer>
        </Content>
      </Grid>
    );
  }
}

AppView.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    firstname: PropTypes.string.isRequired,
    lastname: PropTypes.string.isRequired,
    api_key: PropTypes.string.isRequired,
    redmineEndpoint: PropTypes.string.isRequired
  }).isRequired
}

const mapStateToProps = state => ({
  user: state.user
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(actions.user.logout())
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AppView));
