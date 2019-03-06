import React, { Component } from 'react';
import styled from 'styled-components';
import RedmineAPI from '../redmine/api';
import storage from '../../common/storage';

const Grid = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: 70px auto 70px;
  grid-template-columns: repeat(12, minmax(100px, 1fr));
`;

const Navbar = styled.nav`
  background: teal;
  grid-row: 1;
  grid-column: span 9;
`;

const Aside = styled.aside`
  background: tomato;
  grid-row: 1 / 3;
  grid-column: span 3;
`;

const Footer = styled.footer`
  background: sandybrown;
  grid-column: 1 / -1;
`;

const Content = styled.div`
  background: aliceblue;
  grid-column: span 9;
  grid-row: 2;
`;

class AppView extends Component {
  constructor(props) {
    super(props);
    const { id, firstName, lastName } = storage.get('user');
    this.state = {
      userId: id,
      firstName,
      lastName
    };
  }

  signout = () => {
    RedmineAPI.instance().logout();
    storage.delete('user');
    this.props.history.push('/');
  }

  render() {
    return (
      <Grid>
        <Aside>
          <div>
            <h4>Time Log History</h4>
            <button>X</button>
          </div>
          <div>
            <input type="text" placeholder="search" />
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
          <ul>
            <li>Hamburger</li>
            <li>Projects</li>
            <li>Tasks</li>
            <li>Issues</li>
          </ul>
          <div>
            <span>Firstname Lastname</span>
            <img src="" alt="avatar" />
            <button onClick={this.signout}>Sign out</button>
          </div>
        </Navbar>
        <Content></Content>
        <Footer>
          <span>Task name</span>
          <span>00:00:00</span>
          <button>Stop</button>
        </Footer>
      </Grid>
    );
  }
}

export default AppView;
