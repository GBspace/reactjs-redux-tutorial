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

export const dashboardAddItemAsync = ({ label }) => {
  return async (dispatch, getState) => {
    const { currentListId, dashboardItems } = getState().dashboard

    // *****************************************************************
    // *************
    // ************* STEP #1 - (preparation of the mutation query)
    // *************
    const mutationInsert = gql`mutation CreateNested($data: CreateDashboardItemInput!) {
      createDashboardItem(input: $data) {
        changedDashboardItem {
          id
          label
        }
      }
    }`

    // *****************************************************************
    // *************
    // ************* STEP #2. - preparation of the variables that we need to insert
    // *************
    const variablesInsert = {
      data: { label }
    }

    // *****************************************************************
    // *************
    // ************* STEP #3. - making the mutations and retrieving the newDashboardItemID
    // *************

    try {
      const newDashboardItem = await client
        .mutate({ mutation: mutationInsert, variables: variablesInsert })
        .then((results) => results.data.createDashboardItem.changedDashboardItem)

      // *****************************************************************
      // *************
      // ************* STEP #4. - OK, we've got the ID. Let's update the list
      // *************
      console.info('here is the ID: ', newDashboardItem.id)

      // *****************************************************************
      // *************
      // ************* STEP #5. - preparation of the mutation query
      // *************
      const mutationListUpdate = gql`mutation UpdateDashboardItemListOrder($data: UpdateDashboardItemListOrderInput!) {
        updateDashboardItemListOrder(input: $data) {
          changedDashboardItemListOrder {
            id
            orderListIdsArray
          }
        }
      }`

      // the currentListArray holds an array of IDs, which we will update later
      // via the GraphQL query (see step 6, below)
      const currentListArray = dashboardItems.map((dashboardItem) => dashboardItem.id)

      // *****************************************************************
      // *************
      // ************* STEP #6. - preparation of the variables that we need to have in order to update
      // *************
      const variablesListUpdate = {
        data: {
          // this ID, is the ID of the list which we want to update
          id: currentListId,
          // here is going a current list with all IDS (including the new one)
          // we are using the ES6's "..."  spread operator
          orderListIdsArray: [...currentListArray, newDashboardItem.id]
        }
      }

      // *****************************************************************
      // *************
      // ************* STEP #7. - doing the async backend call with all details
      // ************* (GraphQL query doing the heavy lifting now)
      // *************
      await client
        .mutate({ mutation: mutationListUpdate, variables: variablesListUpdate })

      // *****************************************************************
      // *************
      // ************* STEP #8. - we have updated the list, let's dispatch the new value and ID
      // *************
      dispatch(dashboardAddItem(newDashboardItem))
    } catch (errorReason) {
      // Here you handle any errors.
      // You can dispatch some
      // custom error actions like:
      // dispatch(yourCustomErrorAction(errorReason))

      alert('Apollo client add handler error. See console')
      console.error('apollo client add handler error:', errorReason.message)
    }
  }
}

export const dashboardReorderItemsAsync = (reorderValues) => {
  return async (dispatch, getState) => {
    const { dashboardItems, currentListId } = getState().dashboard

    // *****************************************************************
    // *************
    // ************* STEP #1. - we have moved the reordering function
    // ************* from our action handler to the action creator
    // *************
    const { end: nextPosIndex, start: currPosIndex } = reorderValues
    const element = dashboardItems[currPosIndex]
    let newDashboardItems = [
      ...dashboardItems.slice(0, currPosIndex),
      ...dashboardItems.slice(currPosIndex + 1)
    ]

    newDashboardItems.splice(nextPosIndex, 0, element)

    // *****************************************************************
    // *************
    // ************* STEP #2. - let's prepare the array of IDs (we will use it in our query)
    // *************
    // the currentListArray holds an array of IDs, which we will update later
    // via the GraphQL query (see step 6, below)
    const orderListIdsArray = newDashboardItems.map((dashboardItem) => dashboardItem.id)
    console.info('newListArray', orderListIdsArray)

    // *****************************************************************
    // *************
    // ************* STEP #3. - preparation of the mutation query
    // *************
    const mutationListUpdate = gql`mutation UpdateDashboardItemListOrder($data: UpdateDashboardItemListOrderInput!) {
      updateDashboardItemListOrder(input: $data) {
        changedDashboardItemListOrder {
          id
          orderListIdsArray
        }
      }
    }`

    // *****************************************************************
    // *************
    // ************* STEP #4. - preparation of the variables that
    // ************* we need to have in order to update
    // *************
    const variablesListUpdate = {
      data: {
        // this ID, is the ID of the list which we want to update
        id: currentListId,
        // here is going a current list with all IDS (including the new one)
        orderListIdsArray
      }
    }

    // *****************************************************************
    // *************
    // ************* STEP #5. - doing the async backend call with all details
    // ************* (GraphQL query doing the heavy lifting now)
    // *************
    try {
      await client
        .mutate({ mutation: mutationListUpdate, variables: variablesListUpdate })

      // *****************************************************************
      // *************
      // ************* STEP #6. - let's dispatch the final effect,
      // ************* so the view layer can re-render
      // *************
      dispatch(dashboardReorderItems(newDashboardItems))
    } catch (errorReason) {
      // Here you handle any errors.
      // You can dispatch some
      // custom error actions like:
      // dispatch(yourCustomErrorAction(errorReason))

      alert('Apollo client add handler error. See console')
      console.error('apollo client add handler error:', errorReason.message)
    }
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
    // const mockedId = Math.floor(Date.now() / 1000)
    const newItem = {
      label: action.payload.label,
      id: action.payload.id
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
    const dashboardItems = action.payload

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
