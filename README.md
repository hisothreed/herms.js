# SAPI  (Seated API) 

## Getting to know the Parts

### Communicator 

the core part of our sapi client, the layer responsable for handling the request requirements, getting the token and serializing the
request params, in our case of defining routes, requests interfaces, we won't deal with the communicator or add code to it
unless we want to add really breaking changes to the structure of the whole request, generalizing things etc ..
100% tested, each added feature must be tested. and on each line of code you add/remove you must run ` npm run test `


### Routes (Api managers)

the main principle for this part is to define routes (settings) and their behaviours (how should i act on failure etc..),
you can think about it as the reflection of our ruby on rails api.
for example:
we have a route in the backend defined as :
```js
// how hapi.js implement routes
-------
{
  method: "POST",
  path: "/providers",
  options: {
    auth: false,
    pre: [{ method: validator.create }],
    handler: ProviderController.create
  }
}
```
with this request provided by the backend all what you have to do is to define almost the same 
stuff defined above but with extra members in which we need to handle type conversation and response presentation
this is the implementation of the above api request in our api client

```js
const userRouter = {
  create: (payload: { name: string, password: string }): APIRoute => {
    method: HTTPMethod.POST,
    endPoint: `/providers`,
    options: {
      auth: false,
    },
    params: {
      name: payload.name,
      password: payload.password
    }
  }
}
```

so you just define the endpoint, params, options, headers etc.., basically it's an object containing set of configurations (also type provided)
the way we implemented it is very flexible, in case we want to remove some options or add another, from the communicator perspective, 
not finding something would mean (just ignore it, unless the implementation requires it), so removing things won't break our app, we will see more

## Usage

you need to understand that we define config in our xRouter.ts and export it, then import it in index.ts in the current directory and rexport it as a part of the api module,
the communicator is also exported from this directory as a function called api, we use it like this => api(config: APIRoute);
so we organized the directory to be just like below
```
  - api/
    - core/ 
      ...
    - xRouter.ts
```
the api function is resposible of transforming the config object into a valid request including serializing the params and transforming them into 
request body or string link query depending on the HTTPMethod used in the config
so all you have to do in the actions layer or the view layer is using the  userRouter we defined previously

```js

import { SAPI, userRouter } from './pathTo/api'

// on way to implemet it

await new SAPI().request(userRouter.create({ name: 'foo', password: 'bar' }))

// another way, not recommended at all, as it is not maintainable and may be lost in actions, so we keep those objects 

await new SAPI().request({ 
  method: HTTPMethod.POST,
  endPoint: `/providers`,
  params: {
    name: payload.name,
    password: payload.password
  }
})

```

## SAPI refrence

### Request

#### Request Method

the request method is responsible of executing the passed configurations.

new SAPI().request(APIRoute)

```js

// GET Request

await new SAPI().request(xRouter.index({ page_number: 1, page_limit: 10 }))

await new SAPI().request(xRouter.get({ id: 1 }))


// POST Request

await new SAPI().request(xRouter.create({ name: 'foo', password: 'bar' }))

// PUT Request

await new SAPI().request(xRouter.update({ name: 'foo', password: 'bar' }))

// DELETE Request

await new SAPI().request(xRouter.delete({ id: 1 }))

```

#### Request APIRoute configurations Refrence

```js
{

  // `method` The HTTP method for the request
  // `HTTPMethod` is an enum containing all the methods you need
  method: HTTPMethod.GET,


  // `endPoint` will be appended to the base url
  // you could inject any thing in it, at the end it's just a string
  endPoint: `/cars/mine/${idFromTheOutsideWorld}`,


  // `headers` (optional) to be appended to the request, not required, sapi will send the default headers
  // such as {"Content-Type": "application/json"}, but sure you can overwrite or add your own
  // you can implement it as object or a function returning object, depends on your use case
  // but at the end it must be an object
  headers?: {
    'role': 'admin'
  },

  
  // `parmas` (optional) points both to the request body or the link query string, depends on the method
  // a GET HTTP method will make it parsed and presented in the link
  // you can implement it as object or a function returning object, depends on your use case ( injecting params, checking for nulls, falsy etc..)
  // but at the end it must be an object
  params?: {
    foo: 'bar'
  },


  // `options` (optional), a very usefull object which helps in implementing your own rules for 
  // different request with the default SAPI configurations\
  // you will understand more about this part later on when we will explain defaults.headers
  options?: {
    guest: true
  },


  // `preRequest` (optional) is another extra layer, the same object will be passed by refrence to this method ( containing any changes happened in the
  // previous layers ).
  // You could use pre as a validation layer for your request, cancel in any case, or inject things, call things async
  // always return Promise.reject or throw an error if you want to cancel the request
  // must return Promise.resolve()
  preRequest?: async (configs) => {
    if (config.foo) {
      config.bar = await AsyncStorage.setItem( 'isHeAFoo', 'yep (:' );
    } else {
      throw new FancyError( 'he is not a foo ):' )
    }
    return Promise.resolve();
  },


  // `handler` (optional) giving the ability to handle the response before giving it to the caller, doing multiple async operations
  // such as type conversations, keys mapping etc etc..
  // always return Promise.resolve(data),  containing data which represents what you want the caller to recieve
  handler?: ({ foo, bar }) {
    const Foo = new Foo(foo)
    const Bar = new Bar(bar)
    return Promise.resolve({ Foo, Bar })
  }


  // `onError` (optional) will be called once an error occured from the backend, passing the response,
  // handling errors with status code in range < 299 and > 200
  // the main use case for this layer is to add the ability to covert abstract error message from the api into meaningful message
  // the you could show to the user as an alert or whatever ..
  // once you assigned this layer to a function to handle it, SAPI will count on you to covert the error into the format that suits you
  // if not, sapi will convert it into a FancyError object, thats another big thing and will be discussed in details
  // always return Promise.reject(error), containing your error object,or throw the error, easy as that (=
  onError?: async (response) => {
    let response = await response.json()
    let error
    if (response.messages[0] === 'foo' ) {
      error = new FancyError( 'hey user, your foo has an error, please check it again' )
    } else {
      error = new FancyError( "hey user, we don't know what happened, please try again" )
    }
    throw error
  }
}


```
#### Note

if you want to upload files or make your body in `multipart` format ( FormData ), all what you have to do is
to do in your route is:

```js

headers: {
  "Content-Type": "multipart/form-data"
},

```

### SAPI Defaults

by default SAPI will expose an object called `defaults` for you and it looks like this

```js
static defaults = {
  headers: {},
  baseUrl: "",
  request: {
      use: Function
    },
    response: {
      use: Function
    },
    error: {
      use: Function
    }
}
```

now to define a global and default baseUrl to prepend to every endpoint in you app
all what you have to do is 

```js

import SAPI from "./path/to/api"

SAPI.defaults.baseUrl = "myBaseUrl.com/api/v1"

```

and SAPI will check everytime for this member to prepend that url in the request.

the other part, the headers, the members of this object are basically mapped and injected
into the request headers, each header, the key will be the key of the header in the request.
now for the value, it could be a string, or a function, that function will be executed when SAPI is preparing our request
and will pass the options defined in your request route and then you can make async calls, and decide if you want 
to return a value for that header or make SAPI ignore that header by returning null (define your own rule without changing the inner implementation of the communicator module)
 
#### Example

i want to inject guest token with key of `guest_token` and a value fetched from the AsyncStorage, 
only if i specified in my request `options` that `{ guest: true }`, also to inject the `Authorization` header with it's value (token)
in every request, ignoring the options

```js

// inside ./api/index.ts

import SAPI from "./path/to/api"

// this will be injected in all the request, permanently without looking into the options
SAPI.defaults.headers.Authorization = "dummyToken"

// this code will be implemented only once (remember it's generic you just pick the routes
// that you want a specific rule to work on).

// in api/index.ts
SAPI.defaults.headers.guest_token = async (options) => {
  // this funciton will be called on each request
  if (options.guest) {
    // the below funciton is async, so SAPI will wait for it
    return await AsyncStorage.getItem("guestToken")
  } else {
    // ignore this header for the current request
    return null
  }
}


// inside actions, view, where ever you fire your requests

import SAPI from "./path/to/api"

// define my route configurations
const get = ({ page_number, page_limit }): APIRoute => ({
  method: HTTPMethod.GET,
  endPoint: `/tickets`,
  headers: {
    foo: "bar"
  },
  options: {
    // specified that this route require guest token ( guest rule )
    guest: true
  }
})

await new SAPI().request(get({ page_number: 10, page_limit: 5 }))

```

### Error handling in SAPI

by default, SAPI will handle any errors recieved from the backend, it will wrap it into 
a `FancyError` object, and will pass it to your caller only if you didn't provide your own request error
handler in `onError`.

this `FancyError` class takes the following params in the constructor

| Parameter     | Type          | Description   |
| ------------- | ------------- | ------------- | 
| message       | `string`      | The message of the error |
| code          | `number`      | The status code of the response |
| payload       | `object`      | any extra information you want to pass to the caller |


to create your own error handler just assign the route config property `onError`
into a function, SAPI will call it on error passing the response recieved from the api,
to know more about response, please check `https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch`


### Request APIRoute configurations setup example

the first step, create TicketsRouter.ts and, inside TicketsRouter.ts add the following code

```js
const TicketsRouter = {
  // define how you want to call the function that will return the configurations object for you
  // it is a function because we will absolutly need to pass some input from the user and generate
  // the required configs for that input

  // for example `get` (you can name it `select`, `fetch`, or whatever suit your use case ) is a method defined inside the TicketsRouter
  // we will give it the id of the selected Ticket
  get: ({ id }): APIRoute => ({

    // will define the default method

    method: HTTPMethod.GET,

    // will inject the id passed in the link
    endPoint: `/tickets/${id}`
    
  }),


  // in this method, we will use the normal es5 function style
  // please do not use this keyword, you don't know in which context i'm gonna call this function
  // to prevent any contextual issue. `this is js`
  // 

  index: function({ page_number, page_limit }): APIRoute {
    return {
      // just like what i explained in the method above
      method: HTTPMethod.GET,
      //
      endPoint: `/tickets`,
      // 
      params: {
        page_number,
        page_limit
      },
      //
      preRequest: configurations => {

        // returning the params using spread to prevent forgetting a key even with a really tiny probability that it could happen
        // and merging them with `page_number: 2` (overwriting if page number provided)
        configurations.params = { ...configurations.params, page_number: 2 }
        
        // as always ..
        // we didn't put our configurations object inside resolve(), because we are mutating the original object
        // `configurations` is passed by refrence here
        return Promise.resolve()
      },
      // 
      onError: async (response) => {
        // extract the first error from the response
        let json = await response.json()
        let message = json.messages[0]
        // create new FancyError
        let error = new FancyError(message, 350)
        // throw the error, so that we trigger the `catch()` block for the caller 
        throw error
      },
      handler: ({ tickets }) => {

        // here i'm extracting the tickets from the backend response,
        // filtering them and returning whatever suit me
        tickets = tickets.filter(t => t.user_id === 2)

        // as always ..
        // here i'm returning the response inside resolve, opposite to the `preRequest` function,
        // because whatever you put in resolve() as an argument it will be passed to the caller.
        return Promise.resolve({ tickets })
      }
    }
  }
}

export default TicketsRouter

```

the second step, is to expose it to the world and make it shine,
just add the following inside `directoryTo/api/index.ts`

```js
import SAPI from "./api/core/communicator.ts"

// 1
import TicketRouter from "./TicketsRouter"

              // 2
export { SAPI, TicketRouter }

```

the third step, well just use it in your actions 

```js

import { SAPI, TicketsRouter } from './path/to/api'

const fetchTickets: (payload) => (dispatch) {
  dispatch({ type: IS_FETCHING })
  return sapi(TicketsRouter.index(payload))
    .then({ tickets } => {
      dispatch({ type: SET_TICKETS, tickets })
      dispatch({ type: IS_FETCHING, false })
    })
    .catch(e => {
      dispatch({ type: HAS_ERROR, e })
      dispatch({ type: IS_FETCHING, false })
    })
}

```

## Roadmap

* [x] implement sapi.defaults (setting default kays for a common options/headers)
* [x] split communicator code, make it generic and dynamic based on sapi.defaults
* [x] implement FancyError internaly
* [x] implement generic request/response/error interceptors
* [ ] implement upload/download progress tracking
* [ ] write tests tests tests ((=
* [ ] make it open source

## inspirations

1- [Axios.js](https://github.com/axios/axios#axiosconfig) - using config object in a similiar way, intercepters but we make each route has it's own. <br />
2- [Hapi.js](https://hapijs.com/tutorials) - the way they implement their routes <br />
3- [Alamofire/swift](https://github.com/Alamofire/Alamofire/blob/master/Documentation/AdvancedUsage.md#crud--authorization) - the way they do their requests as well as their implementation <br />