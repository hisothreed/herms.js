import prepareHeaders from "./headers";
import _ from "lodash";
export default function options(requestConfig) {
  const _options = {};
  _options.body = {};

  _options.hooks = {};
  _options.hooks.onResponse = _.isFunction(requestConfig.onResponse) ? requestConfig.onResponse : null;
  _options.hooks.preRequest = _.isFunction(requestConfig.preRequest) ? requestConfig.preRequest : null;
  _options.hooks.onError = _.isFunction(requestConfig.onError) ? requestConfig.onError : null;
  
  let headers = prepareHeaders(requestConfig, this.constructor.defaults);
  _options.headers = headers;

  _options.baseUrl = requestConfig.baseUrl || this.constructor.defaults.baseUrl;
  _options.method = requestConfig.method || "GET";
  _options.endPoint = requestConfig.endPoint || "/";

  handleParams(requestConfig, _options);
  return _options;
}

const handleParams = (config, _options) => {
  if (_options.method === "GET") {
    _options.body = null;
    let params = fetchObject(config.params, config);
    if (!params || Object.keys(params).length === 0) {
      _options.query = "";
      return;
    }
    _options.query = "?" + Object.keys(params)
      .map(key => key + "=" + params[key])
      .join("&");
  } else {
    _options.query = ""
    _options.body = fetchObject(config.params, config) || {};
  }
};

const fetchObject = (value, config) => {
  if (_.isFunction(value)) {
    return value(config);
  }
  if (_.isObject(value)) {
    return value;
  }
  if (_.isString(value) || _.isNumber(value)) {
    return null;
  } else {
    return null;
  }
};
