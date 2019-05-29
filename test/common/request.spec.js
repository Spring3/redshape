const request = require('../../common/request');

describe('Request', () => {
  it('should expose all the necessary functions', () => {
    expect(request.default).toBeTruthy();
    expect(request.makeCancellable).toBeTruthy();
    expect(request.initialize).toBeTruthy();
    expect(request.getInstance).toBeTruthy();
    expect(request.pendingRequests).toBeTruthy();
    expect(request.reset).toBeTruthy();
    expect(request.authorizedRequest).toBeTruthy();
    expect(request.request).toBeTruthy();
  });

  describe('makeCancellable', () => {
    it('should put a cancel token in headers if the id is given', () => {
      const headers = {
        'Content-Type': 'application/json'
      };
      const requestId = 'test-id';
      expect(request.pendingRequests[requestId]).not.toBeTruthy();
      const newHeaders = request.makeCancellable(headers, requestId);
      expect(newHeaders.cancelToken).toBeTruthy();
      expect(newHeaders['Content-Type']).toBe(headers['Content-Type']);
      expect(request.pendingRequests[requestId]).toBeTruthy();
      delete request.pendingRequests[requestId];
    });

    it('should not modify the headers if id is missing', () => {
      const headers = {
        'Content-Type': 'application/json'
      };
      const newHeaders = request.makeCancellable(headers);
      expect(newHeaders).toEqual(headers);
      expect(request.pendingRequests).toEqual({});
    });

    it('should cancel a previous request with the same id if given', () => {
      const headers = {
        'Content-Type': 'application/json'
      };
      const requestId = 'test-id';
      request.makeCancellable(headers, requestId);
      const spy = jest.spyOn(request.pendingRequests[requestId], 'cancel');
      request.makeCancellable(headers, requestId);
      expect(spy).toHaveBeenCalled();
      delete request.pendingRequests[requestId];
    });
  });

  describe('initialize', () => {
    it('should do nothing if the baseURL or the token were not provided', () => {
      const spy = jest.spyOn(request.default, 'create');
      request.initialize('test');
      expect(request.getInstance()).not.toBeDefined();
      expect(spy).not.toHaveBeenCalled();
      request.initialize(undefined, 'test');
      expect(request.getInstance()).not.toBeDefined();
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should create an axios instance with the given baseURL and token', () => {
      const spy = jest.spyOn(request.default, 'create');
      request.initialize('test', 'test');
      expect(request.getInstance()).toBeDefined();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
      request.reset();
    });
  });

  describe('getInstance', () => {
    it('should return the previously created axios instance', () => {
      expect(request.getInstance()).not.toBeDefined();
      request.initialize('test', 'test');
      expect(request.getInstance()).toBeDefined();
      request.reset();
    });
  });

  describe('reset', () => {
    it('should reset the axios instance', () => {
      expect(request.getInstance()).not.toBeDefined();
      request.initialize('test', 'test');
      expect(request.getInstance()).toBeDefined();
      request.reset();
      expect(request.getInstance()).not.toBeDefined();
    });
  });

  describe('authorizedRequest', () => {
    it('should throw an error if an axios instance was not initialized', async () => {
      expect(request.getInstance()).not.toBeDefined();
      try {
        await request.authorizedRequest();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('401 - Unauthorized');
      }
    });

    it('should make request cancellable if a request id was given', async () => {
      const id = 'test-id';
      expect(request.pendingRequests[id]).not.toBeDefined();
      try {
        await request.authorizedRequest({ id });
      } catch (error) {} // eslint-disable-line
      expect(request.pendingRequests[id]).toBeTruthy();
      delete request.pendingRequests[id];
    });

    it('should call the axios instance with the given config', async () => {
      request.initialize('test', 'test');
      const instanceSpy = jest.spyOn(request.getInstance(), 'request').mockResolvedValue({});
      const defaultSpy = jest.spyOn(request.default, 'request');
      await request.authorizedRequest();
      expect(instanceSpy).toHaveBeenCalled();
      expect(defaultSpy).not.toHaveBeenCalled();
      instanceSpy.mockRestore();
      defaultSpy.mockRestore();
      request.reset();
    });

    it('should remove a request from pending in case of a success', async () => {
      request.initialize('test', 'test');
      const id = 'test-id';
      const requestSpy = jest.spyOn(request.getInstance(), 'request').mockImplementation(() => {
        expect(request.pendingRequests[id]).toBeTruthy();
        return Promise.resolve({});
      });
      await request.authorizedRequest({ id });
      expect(requestSpy).toHaveBeenCalled();
      expect(request.pendingRequests[id]).not.toBeDefined();
      requestSpy.mockRestore();
      request.reset();
    });

    it('should remove a request from pending in case of a failure', async () => {
      request.initialize('test', 'test');
      const id = 'test-id';
      const requestSpy = jest.spyOn(request.getInstance(), 'request').mockImplementation(() => {
        expect(request.pendingRequests[id]).toBeTruthy();
        const error = new Error('Test');
        error.status = 500;
        return Promise.reject(error);
      });
      try {
        await request.authorizedRequest({ id });
      } catch (error) {
        expect(error.message).toBe('Error 500 (Test)');
        expect(requestSpy).toHaveBeenCalled();
        expect(request.pendingRequests[id]).not.toBeDefined();
        requestSpy.mockRestore();
        request.reset();
      }
    });
  });

  describe('request', () => {
    it('should call a default axios instance with a given config', async () => {
      const spy = jest.spyOn(request.default, 'request').mockResolvedValue({});
      await request.request();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should know how to handle rejected requests', async () => {
      const spy = jest.spyOn(request.default, 'request').mockRejectedValue(new Error('Test'));
      try {
        await request.request();
      } catch (error) {
        expect(spy).toHaveBeenCalled();
        expect(error.message).toBe('Error (Test)');
        spy.mockRestore();
      }
    });
  });
});
