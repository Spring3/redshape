import _ from 'lodash';

import storage from '../../common/storage';
import { FIELD_GET_ALL } from '../actions/field.actions';

export const initialState = {
  data: {},
  isFetching: false,
  error: undefined
};

const convertFieldData = (fieldData) => {
  if (!fieldData) {
    return {};
  }

  const { public_custom_fields } = fieldData;

  const mapFields = {
    issue: [],
    time_entry: []
  };

  public_custom_fields.forEach((el) => {
    const {
      id,
      name,
      customized_type,
      description,
      field_format,
      is_required,
      regexp,
      min_length,
      max_length,
      default_value,
      visible,
      // editable,
      position,
      multiple,
      possible_values,
      is_computed,
    } = el;
    let valid = false;
    if (id >= 0 && name && customized_type && field_format && typeof is_required === 'boolean'
        && typeof default_value === 'string' && visible === true && !is_computed) {
      if (customized_type === 'issue' || customized_type === 'time_entry') {
        switch (field_format) {
          case 'bool':
          case 'link':
          case 'int':
          case 'float':
          case 'string':
          case 'text':
          case 'date': {
            valid = true;
          } break;
          case 'list': {
            if (_.isArray(possible_values)) {
              valid = true;
            }
          }
        }
        if (valid) {
          mapFields[customized_type].push({
            id,
            name,
            description,
            field_format,
            ...(possible_values ? { possible_values } : {}),
            default_value,
            multiple,
            regexp,
            min_length,
            max_length,
            position,
            is_required,
          });
        }
      }
    }

    if (!valid) {
      console.error('Error: invalid custom field', el);
    }
  });

  return mapFields;
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FIELD_GET_ALL: {
      switch (action.status) {
        case 'START': {
          return { ...state, isFetching: true };
        }
        case 'OK': {
          const data = convertFieldData(action.data);
          const nextState = {
            ...state,
            isFetching: false,
            data,
            error: undefined
          };
          storage.set('fields', nextState);
          return nextState;
        }
        case 'NOK': {
          return { ...state, isFetching: false, error: action.data };
        }
        default:
          return state;
      }
    }
    default:
      return state;
  }
};
