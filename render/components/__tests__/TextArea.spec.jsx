import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TextArea from '../TextArea';

describe('TextArea component', () => {
  it('should render the text area', () => {
    const { debug } = render(<TextArea onChange={() => {}} />);
    debug();
  });

  it('should react to the onChange event', () => {
    const onChange = jest.fn();
    const { debug } = render(
      <TextArea onChange={onChange} />
    );

    const event = {
      target: {
        value: '123test'
      },
      persist: () => {}
    };

    fireEvent.change(document.querySelector('textarea'), event);

    debug();

    expect(onChange).toHaveBeenCalled();
  });
});
