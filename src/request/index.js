import { Request } from "node-fetch";

class CustomRequest {
  constructor(options) {
    this.prepareRequest(options);
  }

  prepareRequest(options) {
    this.url = `${options.baseUrl}${options.endPoint}${options.query}`;
    this.method = options.method;
    this.body = options.body;
    this.headers = options.headers;
  }

  generateFetchRequest() {
    let options = {
      method: this.method,
      body: this.body ? JSON.stringify(this.body) : null,
      headers: this.headers
    };
    return new Request(this.url, options);
  }
}

export default CustomRequest;
