import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import Copyrights from '../Copyrights';

const mockStore = configureStore([thunk]);

describe('Copyrights Component', () => {
  it('should match the snapshot', () => {
    const state = {
      session: {
        statusBar: ''
      }
    };
    // const tree = renderer.create(<Copyrights />).toJSON();
    const store = mockStore(state);
    const tree = renderer.create(
      <Provider store={store}>
        <Copyrights />
      </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
