import _ from "lodash";

export default function headers(config, defaults) {
  // configurations passed by the user (instance)
  let _config = config || {};
  // it was passed, just take it as it is and add keys
  let _headers = _config.headers || {};
  // options passed by the user in that specific request
  let _options = _config.options || {};
  // defaults passed by the user (singleton)
  let _defaults = defaults || {};
  let _defaultHeaders = _defaults.headers || {};
  // will go through the default header and check if there is any
  // thing to inject in this request headers
  _.forEach(_defaultHeaders, (value, key) => {
    if (_.isFunction(value)) {
      return (_headers[key] = value(_options));
    }
    if (_.isString(value) || _.isNumber(value)) {
      return (_headers[key] = value);
    } else {
      return null;
    }
  });

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ..._headers
  };
}
