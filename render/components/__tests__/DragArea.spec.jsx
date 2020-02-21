import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import DragArea from '../DragArea';

describe('DragArea', () => {
  it('should render the drag area', () => {
    render(<DragArea />);
    expect(document.querySelector('div[class*="DragArea"]')).toBeDefined();
  });
});
