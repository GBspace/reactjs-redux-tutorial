import React, { PropTypes } from 'react'
import Dashboard from 'components/Dashboard'

class DashboardRoute extends React.Component {

  static propTypes = {
    dashboardVisitIncrement: PropTypes.func.isRequired,
    dashboardAddItem: PropTypes.func.isRequired,
    dashboardEditItem: PropTypes.func.isRequired,
    dashboardReorderItems: PropTypes.func.isRequired,
    dashboard: PropTypes.object.isRequired
  }

  componentDidMount () {
    this.props.dashboardVisitIncrement()
  }

  updateItem = ({ editItemIndex, label }) => (
    editItemIndex === null
    ? this.props.dashboardAddItem({ label })
    : this.props.dashboardEditItem({ editItemIndex, label })
  )

  reorderItem = ({ start, end }) => {
    end = parseInt(end)
    start = parseInt(start)

    // the div ids have to be numbers to reorder correctly
    // and the start and end value has to be different (otherwise reorder is not required)
    const reorderIsCorrect = !isNaN(start) && !isNaN(end) && start !== end
    if (reorderIsCorrect) {
      this.props.dashboardReorderItems({ start, end })
    }
  }

  render () {
    const { dashboard } = this.props
    return (
      <Dashboard
        reorderItem={this.reorderItem}
        visitsCount={dashboard.visitsCount}
        dashboardItems={dashboard.dashboardItems}
        updateItem={this.updateItem} />
    )
  }
}

export default DashboardRoute
