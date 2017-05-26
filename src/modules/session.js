import { graphLogin } from '../utils/api'
// ------------------------------------
// Constants
// ------------------------------------
export const SESSION_LOGIN_SUCCESS = 'SESSION_LOGIN_SUCCESS'
export const SESSION_LOGIN_FAIL = 'SESSION_LOGIN_FAIL'
export const SESSION_LOGOUT_SUCCESS = 'SESSION_LOGOUT_SUCCESS'
// ------------------------------------
// Actions
// ------------------------------------
export function loginSuccess (value) {
  return {
    type    : SESSION_LOGIN_SUCCESS,
    payload : value
  }
}

export function loginFail (value) {
  return {
    type    : SESSION_LOGIN_FAIL,
    payload : value
  }
}

export function sessionLogoutSuccess () {
  return {
    type: SESSION_LOGOUT_SUCCESS
  }
}

export const loginAsync = (loginObj, push) => {
  return async (dispatch, getState) => {
    await graphLogin(loginObj.user, loginObj.password)
      .then(loginObject => {
        const userDetails = loginObject.user
        localStorage.setItem('currentToken', loginObject.token)
        localStorage.setItem('currentUsername', userDetails.username)
        localStorage.setItem('currentUserId', userDetails.id)
        dispatch(loginSuccess(loginObject))
      })
      .catch(errorReason => {
        // Here you handle any errors.
        // You can dispatch some
        // custom error actions like:
        // dispatch(yourCustomErrorAction(errorReason))
        dispatch(loginFail(errorReason.graphQLErrors[0].message))
      })
  }
}

export const checkIflAlreadyLogin = () => {
  return async (dispatch, getState) => {
    // TODO: The login functionality, still is missing
    // recognition mechanism when a login token
    // is expried
    const currentToken = localStorage.getItem('currentToken')
    const currentUsername = localStorage.getItem('currentUsername')
    const currentUserId = localStorage.getItem('currentUserId')
    const isLoggedIn = currentToken && currentUsername && currentUserId
    if (isLoggedIn) {
      const loginUserObj = {
        token: currentToken,
        user: {
          username: currentUsername,
          id: currentUserId
        }
      }
      dispatch(loginSuccess(loginUserObj))
    }
  }
}

export const clearStorageAndLogout = () => {
  return async (dispatch, getState) => {
    localStorage.clear()
    dispatch(sessionLogoutSuccess())
  }
}
// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [SESSION_LOGIN_SUCCESS]: (state, action) => {
    const loginUserObj = action.payload
    const userDetails = loginUserObj.user
    return {
      ...state,
      loginToken: loginUserObj.token,
      username: userDetails.username,
      userId: userDetails.id,
      errorMessage: null,
      isLoggedIn: true
    }
  },
  [SESSION_LOGIN_FAIL]: (state, action) => {
    return {
      ...state,
      loginToken: 'invalid',
      errorMessage: action.payload
    }
  },
  [SESSION_LOGOUT_SUCCESS]: (state, action) => {
    return {
      ...state,
      loginToken: 'none',
      isLoggedIn: false,
      username: null,
      userId: null
    }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  count: 0,
  isLoggedIn: false,
  loginToken: 'none',
  errorMessage: null,
  username: null,
  userId: null
}

export default function dashboardReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
