import React, { PropTypes } from 'react'

const ListJXS = ({ dashboardItems }) => {
  const items = dashboardItems.map((item, i) => (
    <h4 key={i}>{item.label}</h4>
  ))

  return (
    <div>
      { items }
    </div>
  )
}

ListJXS.propTypes = {
  dashboardItems: PropTypes.array.isRequired
}

export default ListJXS
