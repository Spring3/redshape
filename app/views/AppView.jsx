import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

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
      showTimeEntryModal: false
    };
  }

  componentWillMount() {
    this.props.getProjectData();
  }

  onTrackingStop = (value) => {
    this.props.stopTimer(value);
    this.setState({ showTimeEntryModal: true });
    storage.delete('time_tracking');
  }

  closeTimeEntryModal = () => {
    this.setState({ showTimeEntryModal: false });
  }

  render() {
    const { showTimeEntryModal } = this.state;
    const {
      userId,
      api_key,
      match,
      isTimerEnabled,
      isTimerPaused,
      timerIssueTitle,
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
            issueTitle={timerIssueTitle}
            trackedTime={trackedDuration}
            onPause={pauseTimer}
            onContinue={continueTimer}
            onStop={this.onTrackingStop}
          />
          {/* <TimeEntryModal
            isOpen={showTimeEntryModal}
            isEditable={false}
            onClose={this.closeTimeEntryModal}
            activities={this.getProjectActivities(selectedTimeEntry.project.id)}
            isUserAuthor={selectedTimeEntry.user.id === user.id}
            timeEntry={selectedTimeEntry}
            onClose={this.closeTimeEntryModal}
          /> */}
        </Content>
      </Grid>
    );
  }
}

AppView.propTypes = {
  userId: PropTypes.number.isRequired,
  api_key: PropTypes.string.isRequired,
  match: PropTypes.shape({
    path: PropTypes.string.isRequired
  }).isRequired,
  logout: PropTypes.func.isRequired,
  getProjectData: PropTypes.func.isRequired,
  isTimerEnabled: PropTypes.bool.isRequired,
  isTimerPaused: PropTypes.bool.isRequired,
  timerIssueTitle: PropTypes.string,
  trackedDuration: PropTypes.number,
  pauseTimer: PropTypes.func.isRequired,
  continueTimer: PropTypes.func.isRequired,
  stopTimer: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  userId: state.user.id,
  api_key: state.user.api_key,
  isTimerEnabled: state.tracking.isTracking,
  isTimerPaused: state.tracking.isPaused,
  timerIssueTitle: state.tracking.issue.subject,
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
