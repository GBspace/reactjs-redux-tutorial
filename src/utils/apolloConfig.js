import ApolloClient, { createNetworkInterface } from 'apollo-client'

const config = {
  scapholdUrl: 'https://us-west-2.api.scaphold.io/graphql/t-reactjs-co2'
}

const opts = { uri: config.scapholdUrl }
const networkInterface = createNetworkInterface(opts)
const client = new ApolloClient({
  networkInterface
})

export default client
