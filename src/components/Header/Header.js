import React from 'react'
import { IndexLink, Link } from 'react-router'
import './Header.scss'
import LoginJSX from './LoginJSX'
import LogoutJSX from './LogoutJSX'
import PropTypes from 'prop-types'

export const Header = ({ session, handleLogin, handleLogout }) => {
  let loginMessageJSX = (!session.isLoggedIn && session.loginToken === 'invalid')
    ? <p>{session.errorMessage}</p>
    : null

  return (
    <div>
      <h1>React Redux Starter Kit</h1>
      <IndexLink to='/' activeClassName='route--active'>
        Home
      </IndexLink>
      {' · '}
      <Link to='/counter' activeClassName='route--active'>
        Counter
      </Link>
      {' · '}
      <Link to='/dashboard' activeClassName='route--active'>
        Dashboard
      </Link>
      { !session.isLoggedIn && <LoginJSX handleLogin={handleLogin} /> }
      { session.isLoggedIn && <LogoutJSX handleLogout={handleLogout} />}
      {loginMessageJSX}
    </div>
  )
}

Header.propTypes = {
  session: PropTypes.object.isRequired,
  handleLogin: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired
}

export default Header
