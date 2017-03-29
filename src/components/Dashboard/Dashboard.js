import React from 'react'
import './Dashboard.scss'
import ListJSX from './ListJSX'

export class Dashboard extends React.Component {
  static propTypes = {
    dashboardItems   : React.PropTypes.array.isRequired,
    updateItem       : React.PropTypes.func.isRequired,
    visitsCount      : React.PropTypes.number.isRequired
  }

  state = {
    inputValue: '',
    editedItemIndex: null
  }

  onChangeInput = ev => this.setState({ inputValue: ev.target.value })

  onSubmit = ev => {
    ev.preventDefault()
    const { inputValue: label, editedItemIndex: editItemIndex } = this.state
    if (label && label.length) {
      this.props.updateItem({ label, editItemIndex })
      this.setState({
        inputValue: '',
        editedItemIndex: null
      })
    } else {
      alert('Value can\'t be empty')
    }
  }

  itemOnEdit = (editedItemIndex) => () => {
    const editedItem = this.props.dashboardItems[editedItemIndex]
    this.setState({ inputValue: editedItem.label, editedItemIndex })
  }

  render () {
    const { visitsCount, dashboardItems } = this.props

    return (
      <div>
        <h2 className='dashboardContainer' >
          Dashboard visits:
          {' '}
          <span className='dashboard--green' >
            { visitsCount }
          </span>
        </h2>
        <form onSubmit={this.onSubmit}>
          <input
            value={this.state.inputValue}
            type='text'
            placeholder='type here a value'
            className='dashboard-add-item'
            onChange={this.onChangeInput} />
          <input
            value={this.state.editedItemIndex === null ? 'Add New Item To The List' : 'Edit Item'}
            type='submit' />
        </form>
        <ListJSX
          activeIndex={this.state.editedItemIndex}
          dashboardItems={dashboardItems}
          onClick={this.itemOnEdit} />
      </div>
    )
  }
}

export default Dashboard
