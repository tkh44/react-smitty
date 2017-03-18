import { Component, createElement, Children, PropTypes } from 'react'

const storeShape = PropTypes.shape({
  emit: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired,
  off: PropTypes.func.isRequired,
  addReducer: PropTypes.func.isRequired,
  state: PropTypes.any.isRequired
})

export class Provider extends Component {
  constructor (props, context) {
    super(props, context)
    this.store = props.store
  }

  getChildContext () {
    return { store: this.store }
  }

  render () {
    return Children.only(this.props.children)
  }
}

Provider.propTypes = {
  store: storeShape.isRequired,
  children: PropTypes.element.isRequired
}
Provider.childContextTypes = { store: storeShape.isRequired }

export function connect (mapStateToProps) {
  function mapState (props, context) {
    return () => mapStateToProps(context.store.state, props)
  }

  return function wrapComponent (WrappedComponent) {
    class Connect extends Component {
      constructor (props, context) {
        super(props, context)
        this.state = typeof mapStateToProps === 'function' ? mapState(props, context)() : {}
        this.handleStoreUpdate = this.handleStoreUpdate.bind(this)
        this.context.store.on('*', this.handleStoreUpdate)
      }

      componentWillUnmount () {
        this.context.store.off('*', this.handleStoreUpdate)
      }

      render () {
        return createElement(
          WrappedComponent,
          Object.assign({}, Object.assign({}, this.props), this.state, {
            emit: this.context.store.emit
          })
        )
      }

      handleStoreUpdate () {
        if (typeof mapStateToProps !== 'function') return
        this.setState(mapState(this.props, this.context))
      }
    }

    Connect.contextTypes = {
      store: storeShape
    }

    return Connect
  }
}
