import moment from 'moment';
var momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);

const reDuration = /^(?!$) *(?:(\d+) *(?:d|days?))? *(?:(\d+) *(?:h|hours?))? *(?:(\d+) *(?:m|mins?|minutes?))? *(?:(\d+) *(?:s|secs?|seconds?))? *$/;
const reDurationHours = /^ *\d+(?:\.\d+)? *$/;

/**
 * @param str humanized duration string (1d 1h 2 m 1 s) or a string representing the number of hours
 * @returns {null|number} number of hours extracted from humanized duration string or parseFloat
 */
export const durationToHours = (value) => {
  let m = value.match(reDurationHours);
  let hours;
  if (m) {
    hours = parseFloat(value);
  }else{
    m = value.match(reDuration);
    if (m) {
      let d = {day: m[1], hour: m[2], minute: m[3], second: m[4]};
      for (const [k, v] of Object.entries(d)) {
        if (v) {
          d[k] = parseInt(v);
        }
      }
      hours = moment.duration(d).asHours();
    } else {
      return null;
    }
  }
  // if (hours){
  //   hours = Number(hours.toFixed(2));
  // }
  return hours;
}

export const hoursToDuration = (hours) => {
  return hours == null ? '' : moment.duration(parseFloat(hours), "hours").format("d[d] h[h] m[m] s[s]", {
    trim: "both mid"
  });
}
