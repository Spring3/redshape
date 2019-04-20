import moment from 'moment';
import request, { notify } from './helper';

export const ISSUES_GET_ALL = 'ISSUES_GET_ALL';
export const ISSUES_GET = 'ISSUES_GET';
export const ISSUES_COMMENTS_SEND = 'ISSUES_COMMENTS_SEND';

const getAll = (filter, offset, limit) => (dispatch) => {
  let query = {
    include: 'attachments,children,relations,journals'
  };

  if (filter) {
    query = {
      ...query,
      ...filter
    };
  }

  if (offset) {
    query.offset = offset;
  }

  if (limit) {
    query.limit = limit;
  }

  dispatch(notify.start(ISSUES_GET_ALL));

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
  const actionId = 'comments';

  dispatch(notify.start(ISSUES_COMMENTS_SEND, actionId));

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
      actionId
    )
  ))
    .catch((error) => {
      console.error(`Error when trying to assign the issue with id ${issueId}:`, error.message);
      dispatch(notify.nok(ISSUES_COMMENTS_SEND, error, actionId));
    });
};

export default {
  getAll,
  get,
  sendComments
};
