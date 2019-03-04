import React, { Component, Fragment } from 'react';
import storage from '../../common/storage';

class AppView extends Component {
  constructor(props) {
    super(props);
    const { id, firstName, lastName } = storage.get('user');
    this.state = {
      userId: id,
      firstName,
      lastName
    }
  }

  render() {
    return (
      <Fragment>
        <nav>
          <ul>
            <li>Hamburger</li>
            <li>Projects</li>
            <li>Tasks</li>
            <li>Issues</li>
          </ul>
          <div>
            <span>Firstname Lastname</span>
            <img src="" alt="avatar" />
          </div>
        </nav>
        <aside>
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
        </aside>
        <footer>
          <span>Task name</span>
          <span>00:00:00</span>
          <button>Stop</button>
        </footer>
      </Fragment>
    );
  }
}

export default AppView;
