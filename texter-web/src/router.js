import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Route } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'

import Home from './home'
import Campaign from './campaign'
import Segment from './segment'
import { service } from './App'

class Router extends Component {
  render() {
    // switch (this.props.screen) {
    //   case "HOME":
    //     return <Home {...this.props.screenParams} />;
    //   case "CAMPAIGN":
    //     return <Campaign {...this.props.screenParams} />;
    //   default:
    //     return null;
    // }
    return (
      <ConnectedRouter history={service.history}>
        <div
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <Route exact path="/" component={Home} />
          <Route path="/campaign/:id" component={Campaign} />
          <Route path="/segment/:id" component={Segment} />
        </div>
      </ConnectedRouter>
    )
  }
}

const mapStateToProps = state => ({
  screen: state.app.screen,
  screenParams: state.app.screenParams,
})

const mapDispatchToProps = null

export default connect(mapStateToProps, mapDispatchToProps)(Router)
