import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import DragArea from '../DragArea';

describe('DragArea', () => {
  afterEach(cleanup);
  it('should render the drag area', () => {
    render(<DragArea />);
    expect(document.querySelector('div[class*="DragArea"]')).toBeDefined();
  });
});
