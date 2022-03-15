import type { IAction, Context } from 'overmind';
import { Activity, Response } from '../../../types';

const fetchActivities: IAction<void, Promise<Response<Activity[]>>> = async ({ effects, state }: Context) => {
  const response = await effects.mainProcess.request({
    payload: {
      method: 'GET',
      route: 'enumerations/time_entry_activities.json',
    }
  });

  if (response.success) {
    state.enumerations.activities = response.data.activities as Activity[] ?? [];
    return {
      success: true,
      data: state.enumerations.activities,
    };
  }

  return {
    success: false,
    error: response.error
  };
};

export {
  fetchActivities
};
