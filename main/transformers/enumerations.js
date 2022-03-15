const toExternalActivity = (activity) => ({
  id: activity.id,
  name: activity.name,
  isDefault: activity.is_default,
  active: activity.active
});

const transform = ({ route }, responseBody) => {
  if (route === 'enumerations/time_entry_activities.json') {
    const { time_entry_activities } = responseBody;
    return {
      activities: time_entry_activities.map((activity) => toExternalActivity(activity))
    };
  }

  return responseBody;
};

module.exports = {
  transform
};
