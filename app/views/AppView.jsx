import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import MenuIcon from 'mdi-react/MenuIcon';
import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon';

import actions from '../actions';
import { Input } from '../components/Input';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import Button, { GhostButton } from '../components/Button';
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
    this.setState({
      showTimeEntryModal: true
    });
    this.props.trackingStop(value);
    storage.delete('time_tracking');
  }

  closeTimeEntryModal = () => {
    this.setState({
      showTimeEntryModal: false
    });
  }

  render() {
    const { showTimeEntryModal } = this.state;
    const {
      user,
      match,
      tracking,
      trackingPause,
      trackingContinue
    } = this.props;

    return (
      <Grid>
        <DragArea />
        { (!user.id || !user.api_key) ? (<Redirect to="/" />) : null }
        <Navbar />
        <Content>
          <Route exact path={`${match.path}/summary`} component={SummaryPage} />
          <Route path={`${match.path}/issue/:id`} component={IssueDetailsPage} />
          <Timer
            isEnabled={tracking.isTracking}
            isPaused={tracking.isPaused}
            initialValue={tracking.duration}
            text={tracking.issue.subject}
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
  user: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    name: PropTypes.string.isRequired,
    api_key: PropTypes.string.isRequired,
    redmineEndpoint: PropTypes.string.isRequired
  }).isRequired,
  tracking: PropTypes.shape({
    isTracking: PropTypes.bool.isRequired,
    duration: PropTypes.number.isRequired,
    issue: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }).isRequired
  }).isRequired,
  trackedIssueName: PropTypes.string,
  match: PropTypes.shape({
    path: PropTypes.string.isRequired
  }).isRequired
}

const mapStateToProps = state => ({
  user: state.user,
  tracking: state.tracking
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(actions.user.logout()),
  trackingPause: value => dispatch(actions.tracking.trackingPause(value)),
  trackingContinue: () => dispatch(actions.tracking.trackingContinue()),
  trackingStop: value => dispatch(actions.tracking.trackingStop(value)),
  getProjectData: () => dispatch(actions.projects.getAll())
});

export default connect(mapStateToProps, mapDispatchToProps)(AppView);
