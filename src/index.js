import optionsHandler from "./options";
import perform from "./adapter"
import Interceptor from "./interceptor";
import CustomRequest from "./request";

class Hermes {
  static interceptors = {
    onPreRequest: callback =>
      Interceptor.createPreHook.call(Interceptor, callback),
    onResponse: callback =>
      Interceptor.createPostHook.call(Interceptor, callback),
    onError: callback => Interceptor.createErrorHook.call(Interceptor, callback)
  };

  static defaults = { headers: {}, baseUrl: "" };

  constructor(requestOptions) {
    this.initInstance(requestOptions);
  }

  initInstance(requestOptions) {
    let options = optionsHandler.call(this, requestOptions);
    let request = new CustomRequest(options);
    Interceptor.handleHooks(options.hooks);

    return perform(request);
  }
}

export default Hermes