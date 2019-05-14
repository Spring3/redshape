import moment from 'moment';
import request, { notify } from './helper';

export const ISSUES_GET_ALL = 'ISSUES_GET_ALL';
export const ISSUES_GET = 'ISSUES_GET';
export const ISSUES_COMMENTS_SEND = 'ISSUES_COMMENTS_SEND';
export const ISSUES_RESET_SELECTION = 'ISSUES_RESET_SELECTION';

const getPage = (filter, pageNumber, batchSize) => (dispatch, getState) => {
  const { issues } = getState();
  const limit = batchSize || issues.all.limit;
  const page = typeof pageNumber === 'number' && pageNumber >= 0 ? pageNumber : issues.all.page;
  const offset = page * limit;
  let query = {
    include: 'attachments,children,relations,journals',
    offset,
    limit
  };


  if (filter) {
    query = {
      ...query,
      ...filter
    };
  }

  dispatch(notify.start(ISSUES_GET_ALL, { page }));

  return request({
    url: '/issues.json',
    id: 'getAllIssues',
    query
  })
    .then(({ data }) => dispatch(notify.ok(ISSUES_GET_ALL, data)))
    .catch((error) => {
      console.error('Error when trying to get a list of issues:', error.message);
      dispatch(notify.nok(ISSUES_GET_ALL, error));
    });
};

const get = id => (dispatch) => {
  dispatch(notify.start(ISSUES_GET));

  return request({
    url: `/issues/${id}.json`,
    query: {
      include: 'attachments,children,relations,journals'
    },
    id: `getIssueDetails:${id}`
  }).then(({ data }) => dispatch(notify.ok(ISSUES_GET, data)))
    .catch((error) => {
      console.error(`Error when trying to get the issue with id ${id}:`, error.message);
      dispatch(notify.nok(ISSUES_GET, error));
    });
};

const sendComments = (issueId, comments) => (dispatch, getState) => {
  const { user = {} } = getState();

  dispatch(notify.start(ISSUES_COMMENTS_SEND, { subject: 'comments' }));

  return request({
    url: `/issues/${issueId}.json`,
    data: {
      issue: {
        notes: comments
      }
    },
    method: 'PUT'
  }).then(() => dispatch(
    notify.ok(
      ISSUES_COMMENTS_SEND,
      {
        created_on: moment().toLocaleString(),
        details: [],
        id: Date.now(),
        notes: comments,
        private_notes: false,
        user: {
          id: user.id,
          name: user.name
        }
      },
      { subject: comments }
    )
  ))
    .catch((error) => {
      console.error(`Error when trying to assign the issue with id ${issueId}:`, error.message);
      dispatch(notify.nok(ISSUES_COMMENTS_SEND, error, { subject: 'comments' }));
    });
};

const resetSelected = () => ({ type: ISSUES_RESET_SELECTION });

export default {
  getPage,
  get,
  sendComments,
  resetSelected
};
