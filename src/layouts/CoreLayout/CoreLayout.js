import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Header from '../../components/Header'
import './CoreLayout.scss'
import '../../styles/core.scss'
import { connect } from 'react-redux'
import { loginAsync, clearStorageAndLogout, checkIflAlreadyLogin } from '../../modules/session'

const mapActionCreators = {
  loginAsync,
  clearStorageAndLogout,
  checkIflAlreadyLogin
}

const mapStateToProps = (state) => ({
  session: state.session
})

export class CoreLayout extends Component {
  static propTypes = {
    children    : PropTypes.element.isRequired,
    session     : PropTypes.object.isRequired,
    loginAsync  : PropTypes.func.isRequired,
    checkIflAlreadyLogin  : PropTypes.func.isRequired,
    clearStorageAndLogout  : PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object
  }

  componentWillMount () {
    this.props.checkIflAlreadyLogin()
  }

  handleLogin = (loginObj) => {
    this.props.loginAsync(loginObj, (path) => this.context.router.push(path))
  }

  handleLogout = () => {
    this.props.clearStorageAndLogout()
  }

  render () {
    const { children } = this.props

    return (
      <div className='container text-center'>
        <Header
          handleLogin={this.handleLogin}
          handleLogout={this.handleLogout}
          session={this.props.session} />
        <div className='core-layout__viewport'>
          {children}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapActionCreators)(CoreLayout)
