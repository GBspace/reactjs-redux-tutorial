import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import './Header.scss'

const LogoutJSX = ({ handleLogout }) => (
  <span>
    {' · '}
    <Link onClick={handleLogout} className='header-logout-link' >Logout</Link>
  </span>
)

LogoutJSX.propTypes = {
  handleLogout: PropTypes.func.isRequired
}

export default LogoutJSX
