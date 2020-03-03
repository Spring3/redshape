import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { connect } from 'react-redux';
import {
  Route, Redirect, Switch, withRouter
} from 'react-router-dom';
import _get from 'lodash/get';
import moment from 'moment';

import actions from '../actions';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import SummaryPage from './AppViewPages/SummaryPage';
import SettingsPage from './AppViewPages/SettingsPage';
import IssueDetailsPage from './AppViewPages/IssueDetailsPage';
import TimeEntryModal from '../components/TimeEntryModal';
import DragArea from '../components/DragArea';
import storage from '../../common/storage';

import { hoursToDuration } from '../datetime';

import IPC from '../ipc';

const Grid = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: 60px auto 80px;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
`;

const Content = styled.div`
  grid-column: span 12;
  grid-row: 2 / -1;
`;

const StatusBar = styled.div`
  position: fixed;
  z-index: 99999;
  left: 0;
  bottom: 0;
  background-color: #e6e6e6;
  border: 1px solid #ababab;
  padding: 3px 5px;
  border-radius: 0px 3px 3px 0px;
  font-size: 0.8rem;

  transition: visibility 0.5s ease-in-out, opacity 0.5s ease-in-out;
  visibility: hidden;
  opacity: 0;

  &.show {
    visibility: visible;
    opacity: 1;
  }
}
`;

class StatusBarWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: props.content,
      updating: false
    };
    this.t = null;
  }

  componentDidUpdate(oldProps) {
    const { content: oldcontent } = oldProps;
    const { content } = this.props;
    if (oldcontent !== content) {
      if (this.t) {
        clearTimeout(this.t);
        this.t = null;
      }
      if (!oldcontent && content) {
        this.setState({
          content,
          updating: false
        });
      } else {
        this.setState({ updating: true });
        this.t = setTimeout(() => {
          if (this.state.updating) {
            this.setState({
              content
            });
          }
        }, 500);
      }
    }
  }

  render() {
    const { content } = this.props;
    const { content: scontent } = this.state;
    return (<StatusBar className={!content || 'show'}>{scontent}</StatusBar>);
  }
}

class AppView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activities: [],
      showTimeEntryModal: false,
      timeEntry: null
    };

    this.modifyUserMenu();

    this.childRoutePage = React.createRef();
  }

  modifyUserMenu() {
    const {
      idleBehavior, idleTimeDiscard, showAdvancedTimerControls, progressSlider
    } = this.props;
    IPC.send('menu', {
      settings: {
        idleBehavior, idleTimeDiscard, showAdvancedTimerControls, progressSlider
      }
    });
  }

  refreshUser() {
    const { uiStyle, fetchAvatar, avatarId } = this.props;
    if (uiStyle === 'enhanced' && avatarId >= 0) {
      fetchAvatar(avatarId);
    }
  }

  componentWillMount() {
    const { loggedFromServer, getCurrentUser } = this.props;
    if (loggedFromServer) {
      this.refreshUser();
    } else {
      getCurrentUser().then(() => this.refreshUser());
    }
    this.props.getProjectData();
    const { areCustomFieldsEditable } = this.props;
    if (areCustomFieldsEditable) {
      this.props.getFieldsData().then(() => {
        const { customFieldsInvalid, addLog } = this.props;
        if (customFieldsInvalid) {
          customFieldsInvalid.forEach(el => addLog(el));
        }
      });
    }
  }

  onTrackingStop = (trackedIssue, value, comments) => {
    const {
      userId, userName, projects
    } = this.props;
    const activities = _get(projects[trackedIssue.project.id], 'activities', []);
    const hours = parseFloat((value / 3600000).toFixed(3));
    this.setState({
      activities: activities.map(({ id, name }) => ({ value: id, label: name })),
      showTimeEntryModal: true,
      timeEntry: {
        activity: {},
        issue: {
          id: trackedIssue.id,
          name: trackedIssue.subject
        },
        hours,
        duration: hoursToDuration(hours),
        comments: comments || '',
        project: {
          id: trackedIssue.project.id,
          name: trackedIssue.project.name
        },
        spent_on: moment().format('YYYY-MM-DD'),
        user: {
          id: userId,
          name: userName
        }
      }
    });
    storage.delete('time_tracking');
  }

  closeTimeEntryModal = (added) => {
    const { timeEntry } = this.state;
    const issueId = timeEntry && timeEntry.issue.id;

    this.setState({ showTimeEntryModal: false, timeEntry: null });
    this.props.resetTimer();

    if (added && this.props.isStrictWorkflow && issueId) {
      const { match, location } = this.props;
      const pathnameIssue = `${match.path}/issue/${issueId}/`;
      const pathname = location && location.pathname;
      if (pathname === pathnameIssue) {
        const { current } = this.childRoutePage;
        current.openIssueModalIfStrictWorkflow();
      } else {
        setTimeout(() => {
          const { history } = this.props;
          history.push({ pathname: pathnameIssue, state: { action: 'afterTimeEntryAdded' } });
        }, 250);
      }
    }
  }

  onRefresh = () => {
    const { current } = this.childRoutePage;
    if (current && current.onRefresh) {
      current.onRefresh();
    }
  }

  render() {
    const { showTimeEntryModal, timeEntry, activities } = this.state;
    const { userId, api_key, match } = this.props;
    return (
      <Grid>
        <DragArea />
        { (!userId || !api_key) ? (<Redirect to="/" />) : null }
        <Navbar onRefresh={this.onRefresh} />
        <Content>
          <Switch>
            <Route path={`${match.path}/summary/assigned`} render={props => <SummaryPage mode="assigned" key="assigned" {...props} ref={this.childRoutePage} />} />
            <Route path={`${match.path}/summary/author`} render={props => <SummaryPage mode="author" key="author" {...props} ref={this.childRoutePage} />} />
            <Route path={`${match.path}/summary/watching`} render={props => <SummaryPage mode="watching" key="watching" {...props} ref={this.childRoutePage} />} />
            <Route path={`${match.path}/summary/all`} render={props => <SummaryPage mode="all" key="all" {...props} ref={this.childRoutePage} />} />
            <Route path={`${match.path}/settings`} render={props => <SettingsPage {...props} ref={this.childRoutePage} />} />
            <Route path={`${match.path}/issue/:id`} render={props => <IssueDetailsPage key={props.match.params.id} {...props} ref={this.childRoutePage} />} />
            <Redirect to={`${match.path}/summary/assigned`} />
          </Switch>
          <Timer
            onStop={this.onTrackingStop}
            history={this.props.history}
          />
          <TimeEntryModal
            isOpen={showTimeEntryModal}
            isEditable={true}
            activities={activities}
            isUserAuthor={true}
            timeEntry={timeEntry}
            initialVolatileContent={true}
            onClose={this.closeTimeEntryModal}
          />
        </Content>
        <StatusBarWrapper content={this.props.statusBar} />
      </Grid>
    );
  }
}

AppView.propTypes = {
  userId: PropTypes.number.isRequired,
  userName: PropTypes.string.isRequired,
  api_key: PropTypes.string.isRequired,
  match: PropTypes.shape({
    path: PropTypes.string.isRequired
  }).isRequired,
  logout: PropTypes.func.isRequired,
  resetTimer: PropTypes.func.isRequired,
  getProjectData: PropTypes.func.isRequired,
  projects: PropTypes.shape({
    activities: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired).isRequired
  }).isRequired,
  idleBehavior: PropTypes.string.isRequired,
  idleTimeDiscard: PropTypes.bool.isRequired,
  showAdvancedTimerControls: PropTypes.bool.isRequired,
  progressSlider: PropTypes.string.isRequired,
  areCustomFieldsEditable: PropTypes.bool.isRequired,
  statusBar: PropTypes.string.isRequired,
  isStrictWorkflow: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  loggedFromServer: state.user.loggedFromServer,
  userId: state.user.id,
  userName: state.user.name,
  api_key: state.user.api_key,
  projects: state.projects.data,
  idleBehavior: state.settings.idleBehavior,
  idleTimeDiscard: state.settings.idleTimeDiscard,
  showAdvancedTimerControls: state.settings.showAdvancedTimerControls,
  progressSlider: state.settings.progressSlider,
  areCustomFieldsEditable: state.settings.areCustomFieldsEditable,
  customFieldsInvalid: state.fields.invalid,
  uiStyle: state.settings.uiStyle,
  avatarId: state.user.avatar_id,
  statusBar: state.session.statusBar,
  isStrictWorkflow: state.settings.isStrictWorkflow,
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(actions.user.logout()),
  getProjectData: () => dispatch(actions.projects.getAll()),
  getFieldsData: () => dispatch(actions.fields.getAll()),
  resetTimer: () => dispatch(actions.tracking.trackingReset()),
  addLog: reg => dispatch(actions.session.addLog(reg)),
  getCurrentUser: () => dispatch(actions.user.getCurrent()),
  fetchAvatar: id => dispatch(actions.user.fetchAvatar(id)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppView));
