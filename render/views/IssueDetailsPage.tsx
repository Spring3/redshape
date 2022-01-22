import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import styled, { useTheme } from 'styled-components';

import Link from '../components/Link';
import Progressbar from '../components/Progressbar';
import { MarkdownText } from '../components/MarkdownEditor';
import { TimeEntryModal } from '../components/TimeEntryModal';
import { TimeEntries } from '../components/IssueDetailsPage/TimeEntries';
import CommentsSection from '../components/IssueDetailsPage/CommentsSection';
import DateComponent from '../components/Date';
import { OverlayProcessIndicator } from '../components/ProcessIndicator';

import reduxActions from '../actions';
import { useOvermindActions, useOvermindState } from '../store';
import { useNavbar } from '../contexts/NavbarContext';

const Flex = styled.div`
  display: flex;
  padding: 0px 1rem 1rem 1rem;
`;

const Section = styled.section`
  background: white;
  padding: 20px;
  margin-top: 2rem;
  margin-bottom: 60px;
`;

const ColumnList = styled.ul`
  list-style-type: none;
  font-weight: 500;
  margin: 0;
  padding: 0;
  width: auto;
  float: left;
  padding-right: 20px;
  border-radius: 3px;

  li {
    columns: 2;
    margin-bottom: 10px;
    padding: 5px 0px 5px 0px;
    display: flex;
    align-items: center;
  }

  li div {
    width: 220px;
  }

  li div:first-child {
    font-weight: bold;
    width: 150px;
  }
`;

const SmallNotice = styled.p`
  font-size: 12px;
  margin-top: 0px;
  color: ${props => props.theme.minorText};

  a {
    font-size: inherit !important;
    margin-right: 5px;
  }
`;

const Wrapper = styled.div`
  display: inline-block;
  width: 100%;
  margin-top: 10px;
`;

const IssueDetails = styled.div`
  flex-grow: 1;
`;

const Subtasks = styled.div`
  display: inline-block;
`;

const Subtask = styled.div`
  padding: 10px 5px;
  margin-right: 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0px 0px 5px ${props => props.theme.shadow};
  border-radius: 3px;
`;

const CustomFields = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

const FlexWrapper = styled(Wrapper)`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const IssueDetailsPage = ({ postComments }: any) => {
  const [activities, setActivities] = useState([]);
  const [selectedTimeEntry, setSelectedTimeEntry] = useState();
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);

  const navbar = useNavbar();
  const state = useOvermindState();
  const actions = useOvermindActions();
  const theme = useTheme();
  const { id: issueId } = useParams();
  const navigate = useNavigate();

  const projects = state.projects.list;
  const currentIssue = state.issues.byId[issueId as string];

  useEffect(() => {
    if (issueId) {
      actions.issues.getOne({ id: issueId });
    }
  }, [issueId]);

  useEffect(() => {
    if (currentIssue) {
      navbar.setTitle(`#${currentIssue.id} ${currentIssue.subject}`);
    }
  }, [currentIssue, navbar]);

  const triggerTimeEntryModal = (timeEntry: any) => {
    const newSelectedTimeEntry = timeEntry || {
      user: {
        id: state.users.currentUser?.id,
        name: `${state.users.currentUser?.firstName} ${state.users.currentUser?.lastName}`
      },
      issue: {
        id: currentIssue.id
      },
      activity: {},
      project: {
        id: currentIssue.project.id,
        name: currentIssue.project.name
      },
      hours: undefined,
      duration: '',
      spent_on: moment().format('YYYY-MM-DD')
    };
    newSelectedTimeEntry.issue.name = currentIssue.subject;
    const existingActivities = _.get(projects[currentIssue.project.id], 'activities', []);
    setActivities(
      existingActivities.map(({ id, name }: { id: string; name: string }) => ({
        value: id,
        label: name
      }))
    );
    setSelectedTimeEntry(newSelectedTimeEntry);
    setShowTimeEntryModal(true);
  };

  const closeTimeEntryModal = () => {
    setActivities([]);
    setSelectedTimeEntry(undefined);
    setShowTimeEntryModal(false);
  };

  const getIssueComments = () => currentIssue.journals?.filter((entry: any) => entry.notes) ?? [];

  const cfields = currentIssue.customFields;
  // eslint-disable-next-line react/prop-types
  const subtasks = currentIssue.subTasks || [];

  if (!currentIssue.id) {
    return (
      <OverlayProcessIndicator>
        <span>Please wait...</span>
      </OverlayProcessIndicator>
    );
  }

  return (
    <Section>
      <Flex>
        <IssueDetails>
          <SmallNotice>
            Created on:&nbsp;
            <DateComponent date={currentIssue.createdOn} />
            &nbsp;by&nbsp;
            <Link href="#">{currentIssue.author.name}</Link>
          </SmallNotice>
          {currentIssue.createdOn && (
            <SmallNotice>
              Closed on:&nbsp;
              <DateComponent date={currentIssue.createdOn} />
            </SmallNotice>
          )}
          <Wrapper>
            <ColumnList>
              <li>
                <div>Tracker: </div>
                <div>{currentIssue.tracker.name}</div>
              </li>
              <li>
                <div>Status:</div>
                <div>{currentIssue.status.name}</div>
              </li>
              <li>
                <div>Priority: </div>
                <div>{currentIssue.priority.name}</div>
              </li>
              <li>
                <div>Assignee: </div>
                <div>{currentIssue.assignee.name}</div>
              </li>
              <li>
                <div>Project: </div>
                <div>{_.get(currentIssue, 'project.name')}</div>
              </li>
              <li>
                <div>Progress: </div>
                <div>
                  <Progressbar
                    className={undefined}
                    id={undefined}
                    height={5}
                    percent={currentIssue.doneRatio}
                    background={(theme as any).main}
                  />
                </div>
              </li>
            </ColumnList>
            <ColumnList>
              <li>
                <div>Target version: </div>
                <div>{_.get(currentIssue, 'fixed_version.name')}</div>
              </li>
              <li>
                <div>Start date: </div>
                <DateComponent date={currentIssue.startDate} />
              </li>
              <li>
                <div>Due date: </div>
                <DateComponent date={currentIssue.dueDate} />
              </li>
              <li>
                <div>Estimation: </div>
                <div>
                  {currentIssue.estimatedHours
                    ? `${currentIssue.estimatedHours.toFixed(2)} h`
                    : undefined}
                  {currentIssue.totalEstimatedHours &&
                    currentIssue.totalEstimatedHours !== currentIssue.estimatedHours &&
                    currentIssue.totalEstimatedHours >= 0 && (
                      <span>
                        {' '}
                        (Total:
                        {currentIssue.totalEstimatedHours.toFixed(2)} h)
                      </span>
                    )}
                </div>
              </li>
              <li>
                <div>Time spent: </div>
                <div>
                  {currentIssue.spentHours ? `${currentIssue.spentHours.toFixed(2)} h` : undefined}
                  {currentIssue.totalSpentHours &&
                    currentIssue.totalSpentHours !== currentIssue.spentHours &&
                    currentIssue.totalSpentHours >= 0 && (
                      <span>
                        {' '}
                        (Total:
                        {currentIssue.totalSpentHours.toFixed(2)} h)
                      </span>
                    )}
                </div>
              </li>
              <li>
                <div>Time cap: </div>
                <div>
                  <Progressbar
                    className={undefined}
                    id={undefined}
                    height={5}
                    percent={
                      currentIssue.totalSpentHours && currentIssue.totalEstimatedHours
                        ? (currentIssue.totalSpentHours / currentIssue.totalEstimatedHours) * 100
                        : 0
                    }
                    background={(theme as any).main}
                  />
                </div>
              </li>
            </ColumnList>
          </Wrapper>
          <FlexWrapper>
            {subtasks && subtasks.length && (
              <ColumnList>
                <h3>Subtasks:</h3>
                <Subtasks>
                  {subtasks.map((subtask: any, i: number) => (
                    <Subtask>
                      <Link href="#" key={i} onClick={() => navigate(`../${subtask.id}`)}>
                        {`#${subtask.id} - ${subtask.subject}`}
                      </Link>
                    </Subtask>
                  ))}
                </Subtasks>
              </ColumnList>
            )}
            {cfields && cfields.length && (
              <ColumnList>
                <h3>Custom Fields:</h3>
                <CustomFields>
                  {cfields.map((el: any, i: number) => (
                    <li key={i}>
                      <div>{el.name}: </div>
                      <div>{el.value}</div>
                    </li>
                  ))}
                </CustomFields>
              </ColumnList>
            )}
          </FlexWrapper>
          <div>
            <h3>Description</h3>
            <MarkdownText markdownText={currentIssue.description} />
          </div>
        </IssueDetails>
        <TimeEntries issueId={currentIssue.id} showTimeEntryModal={triggerTimeEntryModal} />
      </Flex>
      <CommentsSection
        journalEntries={getIssueComments()}
        publishComments={postComments}
        issueId={currentIssue.id}
      />
      {selectedTimeEntry && (
        <TimeEntryModal
          isOpen={showTimeEntryModal}
          activities={activities}
          isUserAuthor={(selectedTimeEntry as any).user.id === state.users.currentUser?.id}
          timeEntry={selectedTimeEntry}
          onClose={closeTimeEntryModal}
        />
      )}
    </Section>
  );
};

IssueDetailsPage.propTypes = {
  postComments: PropTypes.func.isRequired
};

const mapDispatchToProps = (dispatch: any) => ({
  postComments: (issueId: any, comments: any) =>
    dispatch(reduxActions.issues.sendComments(issueId, comments))
});

export default connect(() => ({}), mapDispatchToProps)(IssueDetailsPage);
