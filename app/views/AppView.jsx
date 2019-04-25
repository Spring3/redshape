import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';

import actions from '../actions';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import SummaryPage from './AppViewPages/SummaryPage';
import IssueDetailsPage from './AppViewPages/IssueDetailsPage';
import TimeEntryModal from '../components/TimeEntryModal';
import DragArea from '../components/DragArea';
import storage from '../../modules/storage';

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

class AppView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activities: [],
      showTimeEntryModal: false,
      timeEntry: null
    };

    this.getProjectActivities = _.memoize((projectId) => {
      
    });
  }

  componentWillMount() {
    this.props.getProjectData();
  }

  onTrackingStop = (value) => {
    const { stopTimer, trackedIssue, trackedDuration, userId, userName, projects } = this.props;
    const activities = _.get(projects[trackedIssue.project.id], 'activities', []);
    this.setState({
      activities: activities.map(({ id, name }) => ({ value: id, label: name })),
      showTimeEntryModal: true,
      timeEntry: {
        activity: {},
        issue: {
          id: trackedIssue.id,
          name: trackedIssue.subject
        },
        hours: (trackedDuration / 360000).toFixed(2),
        comments: '',
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
    stopTimer(value);
    storage.delete('time_tracking');
  }

  closeTimeEntryModal = () => {
    this.setState({ showTimeEntryModal: false });
  }

  render() {
    const { showTimeEntryModal, timeEntry, activities } = this.state;
    const {
      userId,
      api_key,
      match,
      isTimerEnabled,
      isTimerPaused,
      trackedIssue,
      trackedDuration,
      pauseTimer,
      continueTimer
    } = this.props;

    return (
      <Grid>
        <DragArea />
        { (!userId || !api_key) ? (<Redirect to="/" />) : null }
        <Navbar />
        <Content>
          <Route exact path={`${match.path}/summary`} component={SummaryPage} />
          <Route path={`${match.path}/issue/:id`} component={IssueDetailsPage} />
          <Timer
            isEnabled={isTimerEnabled}
            isPaused={isTimerPaused}
            issueTitle={_.get(trackedIssue, 'subject')}
            trackedTime={trackedDuration}
            onPause={pauseTimer}
            onContinue={continueTimer}
            onStop={this.onTrackingStop}
          />
          <TimeEntryModal
            isOpen={showTimeEntryModal}
            isEditable={false}
            onClose={this.closeTimeEntryModal}
            activities={activities}
            isUserAuthor={true}
            timeEntry={timeEntry}
            onClose={this.closeTimeEntryModal}
          />
        </Content>
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
  getProjectData: PropTypes.func.isRequired,
  isTimerEnabled: PropTypes.bool.isRequired,
  isTimerPaused: PropTypes.bool.isRequired,
  trackedIssue: PropTypes.shape({
    id: PropTypes.number.isRequired,
    subject: PropTypes.string.isRequired,
    author: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    project: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    activity: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  projects: PropTypes.shape({
    activities: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired).isRequired
  }).isRequired,
  trackedDuration: PropTypes.number,
  pauseTimer: PropTypes.func.isRequired,
  continueTimer: PropTypes.func.isRequired,
  stopTimer: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  userId: state.user.id,
  userName: state.user.name,
  api_key: state.user.api_key,
  projects: state.projects.data,
  isTimerEnabled: state.tracking.isTracking,
  isTimerPaused: state.tracking.isPaused,
  trackedIssue: state.tracking.issue,
  trackedDuration: state.tracking.duration
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(actions.user.logout()),
  getProjectData: () => dispatch(actions.projects.getAll()),
  pauseTimer: value => dispatch(actions.tracking.trackingPause(value)),
  continueTimer: () => dispatch(actions.tracking.trackingContinue()),
  stopTimer: value => dispatch(actions.tracking.trackingStop(value))
});

export default connect(mapStateToProps, mapDispatchToProps)(AppView);
