const Hermes = require("./dist").default;

Hermes.defaults.headers.authorization = ({ auth }) => {
  if (auth) {
    return "tokenennene";
  } else {
    return null;
  }
};

Hermes.defaults.baseUrl = "http://localhost:5000/api/v1";

Hermes.interceptors.onPreRequest((request) => {
  console.log('====================================');
  console.log("onPreRequest", request);
  console.log('====================================');
  return Promise.resolve();
})

Hermes.interceptors.onError(async (error) => {
  console.log("====================================");
  console.log("error",await error.json());
  console.log("====================================");
  return error
});

Hermes.interceptors.onResponse((response) => {
  console.log('====================================');
  console.log("onResponse", response);
  console.log('====================================');
  return Promise.resolve()
})

new Hermes({
  endPoint: "/tickets/test",
  options: {
    auth: false
  },
  options: {
    auth: true
  },
  onError: (error) => {
    console.log('====================================');
    console.log('in', error);
    console.log('====================================');
  },
  preRequest: (req) => {
    console.log("====================================");
    console.log("preRequest", req);
    console.log("====================================");
  },
  onResponse: () => {
    console.log('====================================');
    console.log("onResponse");
    console.log('====================================');
  }
});