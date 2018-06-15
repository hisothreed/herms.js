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
    while(this._preHooksQueue.length > 0) {
      await this._preHooksQueue.shift()(request);
    }
    return request;
  }

  async beginSuccessChain(json) {
    while(this._postHooksQueue.length > 0) {
      await this._postHooksQueue.shift()(json);
    }
    return Promise.resolve(json);
  }

  async beginErrorChain(json) {
    while(this._errorHooksQueue.length > 0) {
      this._errorHooksQueue.shift()(json);
    } 
    return json
  }
}

export default new Interceptor();
