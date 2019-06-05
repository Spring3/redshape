const utils = require('../../common/utils');

describe('utils', () => {
  it('should expose the utils functions', () => {
    expect(utils.openExternalUrl).toBeTruthy();
    expect(utils.xssFilter).toBeTruthy();
  });

  describe('openExternalUrl', () => {
    it('should print an error if the link uses any protocol but http(s) and mailto:', async () => {
      const http = 'http://test.test';
      const https = 'https://test.test';
      const mailto = 'mailto:140*12';
      const ftp = 'ftp://test.test';
      const spy = jest.spyOn(console, 'error');
      await utils.openExternalUrl(http);
      expect(spy).not.toHaveBeenCalled();
      await utils.openExternalUrl(https);
      expect(spy).not.toHaveBeenCalled();
      await utils.openExternalUrl(mailto);
      expect(spy).not.toHaveBeenCalled();
      await utils.openExternalUrl(ftp);
      expect(spy).toHaveBeenCalledWith('Error when opening external url', ftp, 'Intercepted suspicious url');
    });

    it('should return an error if one occurred', async () => {
      const url = 'https://test.test';
      try {
        await utils.openExternalUrl(url);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(`Error when opening external url ${url} Rejected`);
      }
    });
  });
});
