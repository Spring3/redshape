const MockAdapter = require('axios-mock-adapter');
const axios = require('../../modules/request');
const utils = require('../../modules/utils');

describe('utils', () => {
  it('should expose the utils functions', () => {
    expect(utils.openExternalUrl).toBeTruthy();
    expect(utils.xssFilter).toBeTruthy();
  });

  describe('openExternalUrl', () => {
    let axiosMock;

    beforeAll(() => {
      axiosMock = new MockAdapter(axios.default);
    });

    afterEach(() => {
      axiosMock.reset();
    });

    afterAll(() => {
      axiosMock.restore();
    });

    it('should make a head request to the given link', async () => {
      await utils.openExternalUrl('https://google.com');
      expect(axiosMock.history.head.length).toBe(1);
    });

    it('should print an error if the link uses any protocol but http(s)', async () => {
      const http = 'http://test.test';
      const https = 'https://test.test';
      const ftp = 'ftp://test.test';
      axiosMock.onHead(http).reply(() => Promise.resolve([200]));
      axiosMock.onHead(https).reply(() => Promise.resolve([200]));
      const spy = jest.spyOn(console, 'error');
      await utils.openExternalUrl(http);
      expect(spy).not.toHaveBeenCalled();
      await utils.openExternalUrl(https);
      expect(spy).not.toHaveBeenCalled();
      await utils.openExternalUrl(ftp);
      expect(spy).toHaveBeenCalledWith('Error when opening external url', ftp, 'Intercepted suspicious url');
    });

    it('should return an error if one occurred', async () => {
      const url = 'https://test.test';
      axiosMock.onHead(url).replyOnce(() => Promise.reject(new Error('Rejected')));
      try {
        await utils.openExternalUrl(url);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(`Error when opening external url ${url} Rejected`);
      }
    });
  });
});
