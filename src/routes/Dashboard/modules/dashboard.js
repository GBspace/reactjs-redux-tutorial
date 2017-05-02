import client from 'utils/apolloConfig'
import gql from 'graphql-tag'

// ------------------------------------
// Constants
// ------------------------------------
export const DASHBOARD_INCREMENT = 'DASHBOARD_INCREMENT'
export const DASHBOARD_ADD_ITEM = 'DASHBOARD_ADD_ITEM'
export const DASHBOARD_EDIT_ITEM = 'DASHBOARD_EDIT_ITEM'
export const DASHBOARD_REORDER_ITEM = 'DASHBOARD_REORDER_ITEM'
export const FETCH_DASHBOARD_DATA_SUCCESS = 'FETCH_DASHBOARD_DATA_SUCCESS'

// ------------------------------------
// Actions
// ------------------------------------
export function dashboardAddItem (value) {
  return {
    type    : DASHBOARD_ADD_ITEM,
    payload : value
  }
}

export function fetchDashboardDataSuccess (value) {
  return {
    type: FETCH_DASHBOARD_DATA_SUCCESS,
    payload: value
  }
}

export function dashboardEditItem (value) {
  return {
    type    : DASHBOARD_EDIT_ITEM,
    payload : value
  }
}

export function dashboardVisitIncrement (value = 1) {
  return {
    type    : DASHBOARD_INCREMENT,
    payload : value
  }
}

export function dashboardReorderItems (value) {
  return {
    type    : DASHBOARD_REORDER_ITEM,
    payload : value
  }
}

/*  This is a thunk, meaning it is a function that immediately
    returns a function for lazy evaluation. It is incredibly useful for
    creating async actions, especially when combined with redux-thunk! */

export const fetchDashboardDataAsync = () => {
  return async (dispatch, getState) => {
    const query = gql`query GetAllDashboardItems {
      viewer {
        allDashboardItems  {
          edges {
            node {
              id
              label
            }
          }
        }
      }
    }`

    const dashboardItemsArray = await client
      .query({query})
      .then((results) => {
        const { data: { viewer: { allDashboardItems: { edges } }}} = results
        const resArray = edges.map((item, i) => {
          return item.node
        })
        return resArray
    }).catch((errorReason) => {
      // Here you handle any errors.
      // You can dispatch some
      // custom error actions like:
      // dispatch(yourCustomErrorAction(errorReason))
    })

    dispatch(fetchDashboardDataSuccess(dashboardItemsArray))
  }
}


export const actions = {
  dashboardVisitIncrement
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [FETCH_DASHBOARD_DATA_SUCCESS]: (state, action) => { 
    console.info('1111 action.payload ', action.payload)
    return {
      ...state,
      dashboardItems: action.payload
    }
  },
  [DASHBOARD_INCREMENT]   : (state, action) => ({
    ...state,
    visitsCount : state.visitsCount + action.payload
  }),
  [DASHBOARD_ADD_ITEM]: (state, action) => {
    const mockedId = Math.floor(Date.now() / 1000)
    const newItem = {
      label: action.payload.label,
      id: mockedId
    }

    return {
      ...state,
      dashboardItems: [ ...state.dashboardItems, newItem ]
    }
  },
  [DASHBOARD_EDIT_ITEM]: (state, action) => {
    const { label, editItemIndex: index } = action.payload
    let newItem = {
      ...state.dashboardItems[index],
      label
    }

    const immutableDashboardItems = [
      ...state.dashboardItems.slice(0, index),
      newItem,
      ...state.dashboardItems.slice(index + 1)
    ]
    return {
      ...state,
      dashboardItems: immutableDashboardItems
    }
  },
  [DASHBOARD_REORDER_ITEM]: (state, action) => {
    const { end: nextPosIndex, start: currPosIndex } = action.payload
    const element = state.dashboardItems[currPosIndex]
    let dashboardItems = [
      ...state.dashboardItems.slice(0, currPosIndex),
      ...state.dashboardItems.slice(currPosIndex + 1)
    ]

    dashboardItems.splice(nextPosIndex, 0, element)

    return {
      ...state,
      dashboardItems
    }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  dashboardHasFetchedData: false,
  visitsCount: 0,
  dashboardItems: [
  ]
}

export default function dashboardReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
