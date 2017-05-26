import client from 'utils/apolloConfig'
import gql from 'graphql-tag'

export const loginRequest = async (login, password) => {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 200)
  }).then(() => {
    if (login === 'przeor' && password === 'mwp.io') {
      return 'www.mwp.io' // just a mocked token
    } else {
      return 'invalid' // mocked non successful login
    }
  })
}

export const graphLogin = async (username, password) => {
  const mutation = gql `mutation LoginUserMutation($data: LoginUserInput!) {
    loginUser(input: $data) {
      token
      user {
        id
        username
      }
    }
  }`

  const variables = {
    data: {
      username,
      password
    }
  }

  return await client
    .mutate({ mutation, variables })
    .then((results) => {
      return results.data.loginUser
    })
}
