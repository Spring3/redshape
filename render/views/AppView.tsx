import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import _get from 'lodash/get';
import moment from 'moment';
// eslint-disable-next-line
import { ipcRenderer } from 'electron';

import actions from '../actions';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import SummaryPage from './AppViewPages/SummaryPage';
import IssueDetailsPage from './AppViewPages/IssueDetailsPage';
import TimeEntryModal from '../components/TimeEntryModal';
import DragArea from '../components/DragArea';

import { hoursToDuration } from '../datetime';
import { useOvermindState } from '../store';

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

type AppViewProps = {

}

const AppView = ({
  getProjectData, projects, resetTimer, history, match
}: any) => {
  const [activities, setActivities] = useState([]);
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [timeEntry, setTimeEntry] = useState<any>(null);

  const state = useOvermindState();

  useEffect(() => {
    ipcRenderer.send('menu', { settings: {} });

    return () => {
      getProjectData();
    };
  }, []);

  const onTrackingStop = (trackedIssue: any, value: any, comments: any) => {
    const existingActivities = _get(projects[trackedIssue.project.id], 'activities', []);
    const hours = parseFloat((value / 3600000).toFixed(3));
    setActivities(existingActivities.map(({ id, name }: { id: string, name: string }) => ({ value: id, label: name })));
    setShowTimeEntryModal(true);
    setTimeEntry({
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
        id: state.users.currentUser?.id,
        name: `${state.users.currentUser?.firstName} ${state.users.currentUser?.lastName}`
      }
    });
  };

  const closeTimeEntryModal = () => {
    setShowTimeEntryModal(false);
    setTimeEntry(null);
    resetTimer();
  };

  return (
    <Grid>
      <DragArea />
      {!state.users.currentUser && (<Redirect to="/" />)}
      <Navbar />
      <Content>
        <Route exact path={`${match.path}/summary`} component={(props: any) => <SummaryPage {...props} />} />
        <Route path={`${match.path}/issue/:id`} component={(props: any) => <IssueDetailsPage {...props} />} />
        <Timer
          onStop={onTrackingStop}
          history={history}
        />
        <TimeEntryModal
          isOpen={showTimeEntryModal}
          isEditable={true}
          activities={activities}
          isUserAuthor={true}
          timeEntry={timeEntry}
          initialVolatileContent={true}
          onClose={closeTimeEntryModal}
        />
      </Content>
    </Grid>
  );
};

AppView.propTypes = {
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
  idleBehavior: PropTypes.number.isRequired,
  discardIdleTime: PropTypes.bool.isRequired,
  advancedTimerControls: PropTypes.bool.isRequired,
  progressWithStep1: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = (state: any) => ({
  api_key: state.user.api_key,
  projects: state.projects.data,
  idleBehavior: state.settings.idleBehavior,
  discardIdleTime: state.settings.discardIdleTime,
  advancedTimerControls: state.settings.advancedTimerControls,
  progressWithStep1: state.settings.progressWithStep1,
});

const mapDispatchToProps = (dispatch: any) => ({
  logout: () => dispatch(actions.user.logout()),
  getProjectData: () => dispatch(actions.projects.getAll()),
  resetTimer: () => dispatch(actions.tracking.trackingReset())
});

export default connect(mapStateToProps, mapDispatchToProps)(AppView);
