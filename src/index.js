import { Component, createElement, Children, PropTypes } from 'react'

export class Provider extends Component {
  constructor (props, context) {
    super(props, context)
    this.store = props.store
  }

  getChildContext () {
    return { store: this.store }
  }

  render (props) {
    return Children.only(props.children)
  }
}

const storeShape = PropTypes.shape({
  emit: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired,
  off: PropTypes.func.isRequired,
  addReducer: PropTypes.func.isRequired,
  state: PropTypes.any.isRequired
})

Provider.propTypes = { store: storeShape.isRequired, children: PropTypes.element.isRequired }
Provider.childContextTypes = { store: storeShape.isRequired }

export function connect (mapStateToProps) {
  function mapState (props, context) {
    if (typeof mapStateToProps !== 'function') return
    return mapStateToProps(context.store.state, props)
  }

  return function wrapComponent (WrappedComponent) {
    return class Connect extends Component {
      constructor (props, context) {
        super(props, context)
        this.state = mapState(props, context)

        this.handleStoreUpdate = () => {
          this.updateTimeout = setTimeout(() => { // setState after all events have been handled
            this.setState(mapState(this.props, this.context))
          })
        }

        context.store.on('*', this.handleStoreUpdate)
      }

      componentWillUnmount () {
        window.clearTimeout(this.updateTimeout)
        this.context.store.off('*', this.handleStoreUpdate)
      }

      render () {
        return createElement(
          WrappedComponent,
          Object.assign(
            {},
            Object.assign({}, this.props),
            this.state,
            { emit: this.context.store.emit }
          )
        )
      }
    }
  }
}
