import React from 'react';
import { shallow } from 'enzyme';
import Button from '../../components/Button';

jest.mock('electron-store');

import storage from '../../../modules/storage';
import withRedmine from '../Api';

describe('APIWrapper HOC', () => {
  it('should inject the redmine api props', () => {
    const ButtonWithApi = withRedmine(Button);
    const wrapper = shallow(<ButtonWithApi block={true} disabled={true}>Hello</ButtonWithApi>);
    expect(wrapper.prop('redmineApi')).toBe(undefined);
    expect(wrapper.prop('initializeRedmineApi')).toBeTruthy();
    expect(wrapper.prop('block')).toBe(true);
    expect(wrapper.prop('disabled')).toBe(true);
  });

  it('should initialize the api with the data from storage', () => {
    const storageGetSpy = jest.spyOn(storage, 'get').mockReturnValue({
      redmineDomain: 'https://redmine.somewhere',
      api_key: '123abc'
    });
    const ButtonWithApi = withRedmine(Button);
    const wrapper = shallow(<ButtonWithApi block={true} disabled={true}>Hello</ButtonWithApi>);
    expect(wrapper.prop('redmineApi')).toBeTruthy();
    expect(wrapper.prop('initializeRedmineApi')).toBeTruthy();
    expect(wrapper.prop('block')).toBe(true);
    expect(wrapper.prop('disabled')).toBe(true);
    expect(storageGetSpy).toHaveBeenCalledWith('user');
    storageGetSpy.mockRestore();
  });
});
