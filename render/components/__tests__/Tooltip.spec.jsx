import React from 'react';
import renderer from 'react-test-renderer';

import Tooltip from '../Tooltip';

describe('Tooltip component', () => {
  it('should match the snapshot', () => {
    const tree = renderer.create(
      <Tooltip className="container" text="Hello world">
        <i className="test" />
      </Tooltip>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
