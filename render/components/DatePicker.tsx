import React, { FocusEventHandler, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { formatDate,
  parseDate } from 'react-day-picker/moment';
import { useTheme } from 'styled-components';
import { css } from '@emotion/react';

import MenuLeftIcon from 'mdi-react/MenuLeftIcon';
import MenuRightIcon from 'mdi-react/MenuRightIcon';

import { Input } from './Input';
import { theme as Theme } from '../theme';
import { DayPickerInputProps } from 'react-day-picker';
import moment from 'moment';

const styles = ({
  buttonLeft,
  buttonRight,
  theme
}: {
  buttonLeft: string;
  buttonRight: string;
  theme: typeof Theme;
}) => css`
  .DayPicker {
    display: inline-block;
    font-size: 1rem;
  }

  .DayPicker-wrapper {
    position: relative;
    flex-direction: row;
    padding-bottom: 1em;

    user-select: none;
  }

  .DayPicker-Months {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .DayPicker-Month {
    display: table;
    margin: 0 1em;
    margin-top: 1em;
    border-spacing: 0;
    border-collapse: collapse;

    user-select: none;
  }

  .DayPicker-NavButton {
    position: absolute;
    top: 1em;
    right: 1.5em;
    left: auto;

    display: inline-block;
    margin-top: 2px;
    width: 1.25em;
    height: 1.25em;
    background-position: center;
    background-size: 50%;
    background-repeat: no-repeat;
    cursor: pointer;
  }

  .DayPicker-NavButton:hover {
    opacity: 0.8;
  }

  .DayPicker-NavButton--prev {
    margin-right: 1.5em;
    left: 1.5em;
    right: unset;
    background-image: url('data:image/svg+xml;utf8,${buttonLeft}');
    background-size: 1.5rem;
  }

  .DayPicker-NavButton--next {
    background-image: url('data:image/svg+xml;utf8,${buttonRight}');
    background-size: 1.5rem;
  }

  .DayPicker-NavButton--interactionDisabled {
    display: none;
  }

  .DayPicker-Caption {
    display: table-caption;
    margin-bottom: 0.5em;
    padding: 0 0.5em;
    text-align: center;
  }

  .DayPicker-Caption > div {
    font-weight: 500;
    font-size: 1.15em;
  }

  .DayPicker-Weekdays {
    display: table-header-group;
    margin-top: 1em;
  }

  .DayPicker-WeekdaysRow {
    display: table-row;
  }

  .DayPicker-Weekday {
    display: table-cell;
    padding: 0.5em;
    color: ${theme.normalText};
    font-weight: bold;
    text-align: center;
    font-size: 0.875em;
  }

  .DayPicker-Weekday abbr[title] {
    border-bottom: none;
    text-decoration: none;
  }

  .DayPicker-Body {
    display: table-row-group;
  }

  .DayPicker-Week {
    display: table-row;
  }

  .DayPicker-Day {
    display: table-cell;
    padding: 0.5em;
    border-radius: 50%;
    vertical-align: middle;
    text-align: center;
    cursor: pointer;
  }

  .DayPicker--interactionDisabled .DayPicker-Day {
    cursor: default;
  }

  .DayPicker-Footer {
    padding-top: 0.5em;
  }


  .DayPicker-Day--today {
    color: ${theme.main};
    font-weight: 700;
  }

  .DayPicker-Day--disabled {
    color: ${theme.minorText};
    cursor: default;
  }


  .DayPicker-Day--selected:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside) {
    position: relative;
    background-color: ${theme.normalText};
    color: ${theme.hoverText};
    font-weight: bold;
  }


  .DayPicker:not(.DayPicker--interactionDisabled)
    .DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--selected):not(.DayPicker-Day--outside):hover {
      background-color: ${theme.bgDark};
      color: ${theme.normalText};
  }

  .DayPickerInput {
    display: inline-block;
  }

  .DayPickerInput-OverlayWrapper {
    position: relative;
    left: -30%;
    bottom: -5px;
  }

  .DayPickerInput-Overlay {
    position: absolute;
    left: 0;
    z-index: 1;

    background: ${theme.bg};
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  }
`;

type DatePickerProps = {
  id?: string;
  initialValue?: Date | string;
  name?: string;
  disabled?: boolean;
  onChange: (dateTime: string) => void;
  onBlur?: FocusEventHandler;
};

const DatePicker = ({ id, initialValue, disabled = false, name, onChange, onBlur }: DatePickerProps) => {
  const [value, setValue] = useState<string>(() => {
    const initial = initialValue ?? new Date();

    return moment(initial).format('YYYY-MM-DD');
  });
  const theme = useTheme() as typeof Theme;

  const buttonLeft = encodeURIComponent(
    renderToStaticMarkup(
      <MenuLeftIcon xmlns="http://www.w3.org/2000/svg" color={theme.normalText} />
    )
  );
  const buttonRight = encodeURIComponent(
    renderToStaticMarkup(
      <MenuRightIcon xmlns="http://www.w3.org/2000/svg" color={theme.normalText} />
    )
  );

  const handleDateChange: DayPickerInputProps['onDayChange'] = (date: Date) => {
    const dateString = moment(date).format('YYYY-MM-DD');
    setValue(dateString);
    onChange(dateString);
  };

  return (
    <div id={id} css={styles({ buttonLeft, buttonRight, theme })}>
      <DayPickerInput
        value={value}
        formatDate={formatDate}
        parseDate={parseDate}
        placeholder="YYYY-MM-DD"
        format="YYYY-MM-DD"
        inputProps={{
          disabled,
          name,
          onBlur
        }}
        onDayChange={handleDateChange}
        component={Input}
      />
    </div>
  );
};

export { DatePicker };
