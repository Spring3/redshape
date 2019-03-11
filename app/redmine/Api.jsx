import storage from '../../modules/storage';
import React, { Component } from 'react';

function RedmineAPI(redmineDomain) {
  const json = (res) => {
    if (res.ok) {
      return res.json().then(data => ({ data }));
    }
    throw new Error(`Error ${res.status} (${res.statusText})`);
  };
  const handleError = msg => (error) => {
    console.error(msg, error);
    error.explanation = `${msg} : ${error.message}`; // eslint-disable-line
    return { error };
  };

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
  };

  const request = (method, route, data, requestHeaders = {}) => {
    const requestConfig = {
      method,
      headers: { ...headers, ...requestHeaders },
    };

    if (['PUT', 'POST'].includes(method)) {
      requestConfig.body = data;
    }

    return fetch(`${redmineDomain}${route}`, requestConfig).then(json);
  };

  this.login = ({ username, password, token }) => {
    if (token) {
      headers['X-Redmine-API-Key'] = token;
    } else {
      const hash = btoa(`${username}:${password}`);
      headers.Authorization = `Basic ${hash}`;
    }
  };

  this.projects = {
    getAll: () => request('GET', '/projects.json').catch(handleError('Error when trying to get a list of projects')),
    get: id => request('GET', `/projects/${id}.json`).catch(handleError(`Error when trying to get a project with id ${id}`))
  };

  this.issues = {
    getAll: (filter, offset, limit) => {
      let baseUrl = '/issues.json?include=attachments,children';
      if (filter) {
        baseUrl += filter;
      }

      if (offset) {
        baseUrl += `&offset=${offset}`;
      }

      if (limit) {
        baseUrl += `&limit=${limit}`;
      }

      return request('GET', baseUrl).catch(handleError('Error when trying to get a list of issues'));
    },
    statuses: () => request('GET', '/issue_statuses.json').catch(handleError('Error when trying to get the list of issue statuses')),
    trackers: () => request('GET', '/trackers.json').catch(handleError('Error when trying to get the list of issue trackers')),
    get: id => request('GET', `/issues/${id}.json?include=attachments,children,relations`).catch(handleError(`Error when trying to get the issue with id ${id}`)),
    updateStatus: (issueId, status_id, comment) => request('PUT', `/issues/${issueId}.json`, { notes: comment, status_id }).catch(handleError(`Error when trying to update the status of an issue with id ${issueId}`)),
    assign: (issueId, assignee, comment) => request('PUT', `/issues/${issueId}.json`, { notes: comment, assigned_to_id: assignee}).catch(handleError(`Error when trying to assugn the issue with id ${issueId}`)),
    filter: () => {
      const filter = {};
      const options = {
        issue(ids) {
          filter.issue_id = Array.isArray(ids) ? ids.join(',') : ids;
          return this;
        },
        project(id) {
          filter.project_id = id;
          return this;
        },
        subproject(id) {
          filter.subprojectId = id;
          return this;
        },
        tracker(id) {
          filter.tracker_id = id;
          return this;
        },
        status({ open, closed }) {
          if (open && closed) {
            filter.status_id = '*';
          } else {
            filter.status_id = open ? 'open' : 'closed';
          }
          return this;
        },
        assignee(id) {
          filter.assigned_to_id = id;
          return this;
        },
        author(id) {
          filter.author_id = id;
          return this;
        },
        title(str) {
          filter.subject = encodeURIComponent(`~${str}`);
          return this;
        },
        due(date) {
          filter.due_date = date.toISOString();
          return this;
        },
        createdAt(date) {
          filter.created_on = date.toISOString();
          return this;
        },
        createdBetween(startDate, endDate) {
          filter.created_on = encodeURIComponent(`><${startDate.toISOString()}|${endDate.toISOString()}`);
          return this;
        },
        priority(id) {
          filter.priority_id = id;
          return this;
        },
        build() {
          let str = '';
          for (const [key, value] of Object.entries(filter)) { // eslint-disable-line
            str += `&${key}=${value}`;
          }
          return str;
        }
      };
      return options;
    }
  };

  this.users = {
    getAll: (name, groupId) => {
      let baseUrl = '/users.json?';
      if (name) {
        baseUrl += `&name=${name}`;
      }

      if (groupId) {
        baseUrl += `&group_id=${groupId}`;
      }

      return request('GET', baseUrl).catch(handleError('Error when trying to get the list of users'));
    },
    current: () => request('GET', '/users/current.json').catch(handleError('Error when trying to get the info about current user'))
  };

  this.time = {
    submit: (issueId, date, hours, activityId, comment) => request('POST', '/time_entries.json', {
      time_entry: {
        issue_id: issueId,
        spent_on: date.toISOString(),
        hours,
        activity_id: activityId,
        comments: comment
      }
    }).catch(handleError(`Error when submitting the time to the issue with id ${issueId}`)),
    update: (entryId, issueId, date, hours, activityId, comment) => request('PUT', `/time_entries/${entryId}.json`, {
      time_entry: {
        issue_id: issueId,
        spent_on: date.toISOString(),
        hours,
        activity_id: activityId,
        comments: comment
      }
    }),
    getAll: (offset, limit, userId, projectId, issueId) => {
      let baseUrl = '/time_entries.json?';
      const params = {
        offset,
        limit,
        user_id: userId,
        project_id: projectId,
        issue_id: issueId
      };

      for (const [key, value] of Object.entries(params)) { // eslint-disable-line
        if (value) {
          baseUrl += `&${key}=${value}`;
        }
      }
      return request('GET', baseUrl).catch(handleError('Error when trying to get he list of time entries'));
    }
  };

  this.logout = () => {
    delete headers['X-Redmine-API-Key'];
    delete headers.Authorization;
  };
}


const withRedmine = (BaseComponent) => {
  class APIWrapper extends Component {
    constructor(props) {
      super(props);
      this.state = {
        apiInstance: undefined,
        userId: undefined
      };
    }

    componentWillMount() {
      if (!this.state.apiInstance) {
        const userData = storage.get('user');
        if (userData) {
          const { redmineDomain, api_key } = userData;
          this.initialize(redmineDomain).login({ token: api_key });
        }
      }
    }

    initialize = (redmineDomain) => {
      if (!redmineDomain) {
        throw new Error('redmineDomain is required to initialize the api');
      }
      const apiInstance = new RedmineAPI(redmineDomain);
      this.setState({ apiInstance });
      return apiInstance;
    }

    render() {
      return (
        <BaseComponent
          {...this.props}
          redmineApi={this.state.apiInstance}
          initializeRedmineApi={this.initialize}
        />
      );
    }
  }
  return APIWrapper;
};

export default withRedmine;