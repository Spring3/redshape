import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import _get from 'lodash/get';
import moment from 'moment';

import actions from '../actions';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import SummaryPage from './AppViewPages/SummaryPage';
import IssueDetailsPage from './AppViewPages/IssueDetailsPage';
import TimeEntryModal from '../components/TimeEntryModal';
import DragArea from '../components/DragArea';
import storage from '../../common/storage';

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
  }

  componentWillMount() {
    this.props.getProjectData();
  }

  onTrackingStop = (value, trackedIssue) => {
    const { userId, userName, projects } = this.props;
    const activities = _get(projects[trackedIssue.project.id], 'activities', []);
    this.setState({
      activities: activities.map(({ id, name }) => ({ value: id, label: name })),
      showTimeEntryModal: true,
      timeEntry: {
        activity: {},
        issue: {
          id: trackedIssue.id,
          name: trackedIssue.subject
        },
        hours: (value / 3600000).toFixed(2),
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
    storage.delete('time_tracking');
  }

  closeTimeEntryModal = () => {
    this.setState({ showTimeEntryModal: false, timeEntry: null });
    this.props.resetTimer();
  }

  render() {
    const { showTimeEntryModal, timeEntry, activities } = this.state;
    const { userId, api_key, match } = this.props;

    return (
      <Grid>
        <DragArea />
        { (!userId || !api_key) ? (<Redirect to="/" />) : null }
        <Navbar />
        <Content>
          <Route exact path={`${match.path}/summary`} component={props => <SummaryPage {...props}/>} />
          <Route path={`${match.path}/issue/:id`} component={props => <IssueDetailsPage {...props}/>} />
          <Timer
            onStop={this.onTrackingStop}
            history={this.props.history}
          />
          <TimeEntryModal
            isOpen={showTimeEntryModal}
            isEditable={true}
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
  resetTimer: PropTypes.func.isRequired,
  getProjectData: PropTypes.func.isRequired,
  projects: PropTypes.shape({
    activities: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired).isRequired
  }).isRequired
};

const mapStateToProps = state => ({
  userId: state.user.id,
  userName: state.user.name,
  api_key: state.user.api_key,
  projects: state.projects.data
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(actions.user.logout()),
  getProjectData: () => dispatch(actions.projects.getAll()),
  resetTimer: () => dispatch(actions.tracking.trackingReset())
});

export default connect(mapStateToProps, mapDispatchToProps)(AppView);
