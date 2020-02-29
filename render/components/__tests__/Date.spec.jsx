import React from 'react';
import moment from 'moment';
import { shallow, mount } from 'enzyme';
import DateComponent from '../Date';


describe('Date component', () => {
  it('should render a date, relative to Date.now(), in days', () => {
    const today = new Date().toISOString();
    const yesterday = moment().subtract(1, 'days').toISOString();
    const tenDays = moment().subtract(10, 'days').toISOString();
    const wrapper = mount(
      <div>
        <div id="today">
          <DateComponent
            date={today}
          />
        </div>
        <div id="yesterday">
          <DateComponent
            date={yesterday}
          />
        </div>
        <div id="tenDays">
          <DateComponent
            date={tenDays}
          />
        </div>
      </div>
    );
    expect(wrapper.exists('#today')).toBe(true);
    expect(wrapper.exists('#yesterday')).toBe(true);
    expect(wrapper.exists('#tenDays')).toBe(true);

    expect(wrapper.find('#today').find(DateComponent).find('span > span:first-child').text()).toBe('today');
    expect(wrapper.find('#today').find(DateComponent).find('span > span:last-child').text())
      .toBe(moment(today).format('MMM DD YYYY'));

    expect(wrapper.find('#yesterday').find(DateComponent).find('span > span:first-child').text()).toBe('yesterday');
    expect(wrapper.find('#yesterday').find(DateComponent).find('span > span:last-child').text())
      .toBe(moment(yesterday).format('MMM DD YYYY'));

    expect(wrapper.find('#tenDays').find(DateComponent).find('span > span:first-child').text()).toBe('10 days ago');
    expect(wrapper.find('#tenDays').find(DateComponent).find('span > span:last-child').text())
      .toBe(moment(tenDays).format('MMM DD YYYY'));
  });

  it('should not display if a date was not given', () => {
    const wrapper = shallow(<DateComponent />);
    expect(wrapper.exists(DateComponent)).toBe(false);
    expect(wrapper.children().length).toBe(0);
  });
});
