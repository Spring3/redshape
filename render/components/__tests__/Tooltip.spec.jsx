import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Tooltip from '../Tooltip';

describe('Tooltip component', () => {
  it('should render the tooltip', () => {
    const { getByText } = render(
      <Tooltip className="container" text="Hello world">
        <i className="test" />
      </Tooltip>
    );
    expect(getByText('Hello world')).toBeDefined();
    expect(document.querySelector('i[class="test"]')).toBeDefined();
  });
});
