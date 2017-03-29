import React from 'react'
import './Dashboard.scss'

export const Dashboard = (props) => (
  <div>
    <h2 className='dashboardContainer' >
      Dashboard visits:
      {' '}
      <span className='dashboard--green' >
        {props.dashboard}
      </span>
    </h2>
  </div>
)

Dashboard.propTypes = {
  dashboard   : React.PropTypes.number.isRequired
}

export default Dashboard
