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
    // below we are mocking the list name, but in future
    // when we will have more than just a one list
    // then that name below "dashboardMainListOrder"
    // will be dynamic one

    const dashboardListOrderName = 'dashboardMainListOrder'

    // *****************************************************************
    // *************
    // ************* STEP #1 - (fetch the items order) and
    // ************* STEP #2 - (fetch the items details)
    // *************

    // this query, is asking for the Order and items details
    const query = gql`query GetAllDashboardItemListOrders {
       viewer {
         allDashboardItemListOrders ( where: {
           orderListName: {
             eq: "${dashboardListOrderName}"
           }
         }) {
           edges {
             node {
               id
               orderListIdsArray
               orderListName
             }
           }
         }
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
      .query({ query })
      .then(results => {
        const { allDashboardItems, allDashboardItemListOrders } = results.data.viewer

        // check availablity orders in the response
        if (!(
          allDashboardItemListOrders &&
          allDashboardItemListOrders.edges &&
          allDashboardItemListOrders.edges.length
        )) {
          // thow error, which will catched by error handler below
          throw new Error(`Step 1 & 2. allDashboardItemListOrders collection
wasn't filled. See video how to fill collection`)
        }

        const {
          id : currentListId,
          orderListIdsArray
        } = allDashboardItemListOrders.edges[0].node

        // Prepare convenient format for dashboardItems
        let dashboardItemsJson = {}
        allDashboardItems.edges.map((item, i) => {
          dashboardItemsJson[item.node.id] = item.node
          return item.node
        })

        // *****************************************************************
        // *************
        // ************* STEP #3 - (mix the order with the items details)
        // *************
        const dashboardItemsArrayOrdered = orderListIdsArray.map((listItemID) => {
          return dashboardItemsJson[listItemID]
        })

        return { dashboardItemsArrayOrdered, currentListId }
      }).catch(errorReason => {
        // Here you handle any errors.
        // You can dispatch some
        // custom error actions like:
        // dispatch(yourCustomErrorAction(errorReason))

        alert('Apollo client error. See console')
        console.error('apollo client error:', errorReason.message)
        return {
          dashboardItemsArrayOrdered: [],
          currentListId: null
        } // anyway return empty an array for correctly working fetchDashboardDataSuccess action
      })

    // *****************************************************************
    // *************
    // ************* STEP #4 - (dispatch the dashboardItemsArray)
    // *************
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
    console.info('FETCH_DASHBOARD_DATA_SUCCESS action.payload', action.payload)
    const { dashboardItemsArrayOrdered, currentListId } = action.payload
    return {
      ...state,
      dashboardItems: dashboardItemsArrayOrdered,
      currentListId
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
  currentListId: null,
  dashboardHasFetchedData: false,
  visitsCount: 0,
  dashboardItems: [
  ]
}

export default function dashboardReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
