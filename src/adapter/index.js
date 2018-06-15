import Interceptor from "../interceptor";

export default async function Perform(request) {
  Interceptor.beginPreChain(request);
  let FetchRequest = request.generateFetchRequest();
  return fetch(FetchRequest)
    .then(response => {
      handleFetchResponse(response);
    })
    .catch(e => {
      handleFetchError(e);
    });
}

const handleFetchResponse = async response => {
  if (!response.ok) {
    return Interceptor.beginErrorChain(response);
  }
  let json = await response.json();
  return Interceptor.beginSuccessChain(json);
};

// todo
//
//
const handleFetchError = error => {
  throw error;
};
//
