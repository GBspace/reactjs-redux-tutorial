import React, { PropTypes } from 'react'
import Dashboard from 'components/Dashboard'

class DashboardRoute extends React.Component {

  static propTypes = {
    dashboardVisitIncrement: PropTypes.func.isRequired,
    dashboard: PropTypes.number.isRequired
  }

  componentDidMount () {
    this.props.dashboardVisitIncrement()
  }

  render () {
    return (
      <Dashboard dashboard={this.props.dashboard} />
    )
  }
}

export default DashboardRoute
