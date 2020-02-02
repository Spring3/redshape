import request, { notify } from './helper';

export const FIELD_GET_ALL = 'FIELD_GET_ALL';

const getAll = () => async (dispatch) => {
  dispatch(notify.start(FIELD_GET_ALL));
  const requestPage = () => request({
    url: '/public_custom_fields.json',
    id: 'getFields'
  }).then(({ data }) => data);

  return requestPage()
    .then((results) => {
      dispatch(notify.ok(FIELD_GET_ALL, results));
    })
    .catch((error) => {
      const message = 'Error when trying to get the info about the custom fields';
      console.error(message, error);
      error.message = `${error.message} ${message}`;
      dispatch(notify.nok(FIELD_GET_ALL, error));
    });
};

export default {
  getAll
};
