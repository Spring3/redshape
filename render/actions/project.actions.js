import request, { notify } from './helper';

export const PROJECT_GET_ALL = 'PROJECT_GET_ALL';

const getAll = () => async (dispatch) => {
  dispatch(notify.start(PROJECT_GET_ALL));

  const requestPage = (offset = 0) => request({
    url: '/projects.json',
    query: {
      include: 'time_entry_activities',
      offset
    },
    id: `getProjects:${offset}`
  }).then(({ data }) => data);

  return requestPage()
    .then((data) => {
      const { total_count, offset, limit } = data;
      if (total_count > (offset + limit)) {
        // Math.floor because we already fetched the 1st page.
        const remainingPages = Math.floor(total_count / limit);
        const promises = [data];
        for (let i = 0; i < remainingPages; i++) {
          promises.push(requestPage((i + 1) * limit));
        }
        return Promise.all(promises);
      }
      return [data];
    })
    .then((results) => {
      dispatch(notify.ok(PROJECT_GET_ALL, results));
    })
    .catch((error) => {
      console.error('Error when trying to get the info about the existing projects', error);
      dispatch(notify.nok(PROJECT_GET_ALL, error));
    });
};

export default {
  getAll
};
