import React from 'react';
import renderer from 'react-test-renderer';
import Copyrights from '../Copyrights';

describe('Copyrights Component', () => {
  it('should match the snapshot', () => {
    const tree = renderer.create(<Copyrights />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
