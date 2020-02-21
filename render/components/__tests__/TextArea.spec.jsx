import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TextArea from '../TextArea';

describe('TextArea component', () => {
  afterEach(cleanup);

  it('should render the text area', () => {
    render(<TextArea onChange={() => {}} />);
    expect(document.querySelector('textarea')).toBeDefined();
  });

  it('should react to the onChange event', () => {
    const onChange = jest.fn();
    render(
      <TextArea onChange={onChange} />
    );

    const event = {
      target: {
        value: '123test'
      },
      persist: () => {}
    };

    fireEvent.change(document.querySelector('textarea'), event);

    expect(onChange).toHaveBeenCalled();
  });
});
