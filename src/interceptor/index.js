class Interceptor {
  _preHooksQueue = [];
  _postHooksQueue = [];
  _errorHooksQueue = [];

  createPreHook(callback) {
    this._preHooksQueue.push(callback);
  }

  createPostHook(callback) {
    this._postHooksQueue.push(callback);
  }

  createErrorHook(callback) {
    this._errorHooksQueue.push(callback);
  }

  handleHooks(hooks) {
    if (hooks.onResponse) {
      this._postHooksQueue.push(hooks.onResponse);
    }
    if (hooks.preRequest) {
      this._preHooksQueue.push(hooks.preRequest);
    }
    if (hooks.onError) {
      this._errorHooksQueue.push(hooks.onError);
    }
  }

  async beginPreChain(request) {
    if (this._preHooksQueue.length > 0) {
      await this._preHooksQueue.shift()(request);
    } else {
      return request;
    }
  }

  async beginSuccessChain(json) {
    if (this._postHooksQueue.length > 0) {
      await this._postHooksQueue.shift()(json);
    } else {
      return Promise.resolve(json);
    }
  }

  async beginErrorChain(json) {
    if (this._errorHooksQueue.length > 0) {
      this._errorHooksQueue.shift()(json);
    } else {
      return json
    }
  }
}

export default new Interceptor();
