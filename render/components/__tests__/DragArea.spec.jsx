import React from 'react';
import renderer from 'react-test-renderer';

import DragArea from '../DragArea';

describe('DragArea', () => {
  it('should match the snapshot', () => {
    const tree = renderer.create(<DragArea />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
