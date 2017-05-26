import ApolloClient, { createNetworkInterface } from 'apollo-client'

const config = {
  scapholdUrl: 'https://us-west-2.api.scaphold.io/graphql/reactjs-co'
}

const opts = { uri: config.scapholdUrl }
const networkInterface = createNetworkInterface(opts)
const client = new ApolloClient({
  networkInterface
})

networkInterface.use([{
  applyMiddleware (req, next) {
    if (!req.options.headers) {
      req.options.headers = {}  // Create the header object if needed.
    }

    if (localStorage.getItem('token')) {
      req.options.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
    }

    next()
  }
}])

export default client
