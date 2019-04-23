import React from 'react';
import renderer from 'react-test-renderer';

import DatePicker from '../DatePicker';
import theme from '../../theme';

describe('Date Picker', () => {
  it('should match the snapshot', () => {
    const tree = renderer.create(<DatePicker theme={theme} onChange={() => {}} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
