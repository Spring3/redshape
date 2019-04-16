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
  grid-template-rows: 60px auto;
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
    this.setState({ showTimeEntryModal: true });
    this.props.trackingStop(value);
    storage.delete('time_tracking');
  }

  closeTimeEntryModal = () => this.setState({ showTimeEntryModal: false })

  render() {
    const { showTimeEntryModal } = this.state;
    const {
      userId,
      api_key,
      match,
      isTimerTracking,
      isTimerPaused,
      trackedDuration,
      trackedIssueTitle,
      trackingPause,
      trackingContinue
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
            isEnabled={isTimerTracking}
            isPaused={isTimerPaused}
            initialValue={trackedDuration}
            text={trackedIssueTitle}
            onStop={this.onTrackingStop}
            onPause={trackingPause}
            onContinue={trackingContinue}
          />
          <TimeEntryModal
            isOpen={showTimeEntryModal}
            isEditable={false}
            onClose={this.closeTimeEntryModal}
          />
        </Content>
      </Grid>
    );
  }
}

AppView.propTypes = {
  userId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  api_key: PropTypes.string.isRequired,
  isTimerTracking: PropTypes.bool.isRequired,
  isTimerPaused: PropTypes.bool.isRequired,
  trackedDuration: PropTypes.number.isRequired,
  trackedIssueTitle: PropTypes.string,
  match: PropTypes.shape({
    path: PropTypes.string.isRequired
  }).isRequired,
  logout: PropTypes.func.isRequired,
  trackingPause: PropTypes.func.isRequired,
  trackingContinue: PropTypes.func.isRequired,
  trackingStop: PropTypes.func.isRequired,
  getProjectData: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  userId: state.user.id,
  api_key: state.user.api_key,
  isTrackingTime: state.tracking.isTracking,
  isTimerPaused: state.tracking.isPaused,
  trackedDuration: state.tracking.duration,
  trackedIssueTitle: state.tracking.issue.subject
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(actions.user.logout()),
  trackingPause: value => dispatch(actions.tracking.trackingPause(value)),
  trackingContinue: () => dispatch(actions.tracking.trackingContinue()),
  trackingStop: value => dispatch(actions.tracking.trackingStop(value)),
  getProjectData: () => dispatch(actions.projects.getAll())
});

export default connect(mapStateToProps, mapDispatchToProps)(AppView);
