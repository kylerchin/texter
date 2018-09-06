import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Flex, Box, Text, Toolbar, Heading, NavLink, Tab, Tabs } from 'rebass'
import styled from 'styled-components'
import FA from 'react-fontawesome'
import * as R from 'ramda'

import { FormPopup, FIELD_TYPE } from './components/popups'
import CampaignCard from './components/campaign-card'
import SegmentCard from './components/segment-card'
import { parseCsv } from './util/parse-csv'

class Home extends Component {
  state = {
    addCampaignPopupOpen: false,
    addSegmentPopupOpen: false,
    campaignTitle: '',
    campaignMessage: '',
    campaignSegment: '',
    campaignMediaUrl: '',
    segmentName: '',
    segmentFile: {},
    showSent: false,
  }

  renderAddCampaignPopup() {
    const close = () =>
      this.setState({
        addCampaignPopupOpen: false,
        campaignTitle: '',
        campaignMessage: '',
        campaignSegment: '',
        campaignMediaUrl: '',
      })

    return (
      <FormPopup
        active={this.state.addCampaignPopupOpen}
        fields={[
          {
            name: 'Title',
            value: this.state.campaignTitle,
            update: e => this.setState({ campaignTitle: e.target.value }),
          },
          {
            name: 'Message',
            value: this.state.campaignMessage,
            update: e => this.setState({ campaignMessage: e.target.value }),
            type: 'TEXTAREA',
          },
          {
            name: 'Media URL',
            value: this.state.campaignMediaUrl,
            update: e => this.setState({ campaignMediaUrl: e.target.value }),
          },
          {
            name: 'Segment',
            value: this.state.campaignSegment,
            update: e => this.setState({ campaignSegment: e.target.value }),
            type: 'DROPDOWN',
            options: Object.values(this.props.segments).map(s => s.name),
          },
        ]}
        onClose={close}
        onConfirm={() => {
          const segments = Object.values(this.props.segments)
          const seg = segments.find(s => s.name === this.state.campaignSegment)

          this.props.addCampaign({
            title: this.state.campaignTitle,
            message: this.state.campaignMessage,
            mediaUrl: this.state.campaignMediaUrl,
            segmentId: seg._id,
          })
        }}
        confirmText="Create"
      />
    )
  }

  renderAddSegmentPopup() {
    const close = () =>
      this.setState({
        addSegmentPopupOpen: false,
        segmentName: '',
        segmentFile: {},
      })

    return (
      <FormPopup
        active={this.state.addSegmentPopupOpen}
        fields={[
          {
            name: 'Name',
            value: this.state.segmentName,
            update: e => this.setState({ segmentName: e.target.value }),
          },
          {
            name: 'Import CSV (optional)',
            value: this.state.segmentFile,
            update: async files => {
              const data = await parseCsv(files[0])
              this.setState({ segmentFile: { fileName: files[0].name, data } })
            },
            type: FIELD_TYPE.FILE,
          },
        ]}
        onClose={close}
        onConfirm={() =>
          this.props.addSegment(
            this.state.segmentName,
            this.state.segmentFile && this.state.segmentFile.data,
          )
        }
        confirmText="Create"
      />
    )
  }

  render() {
    if (!this.props.campaigns || !this.props.segments) {
      return (
        <div className="App">
          <Text>Loading...</Text>
        </div>
      )
    }

    const segments = Object.values(this.props.segments).map(segment => {
      const localUnread = localStorage.getItem(segment._id)
      if (!localUnread || localUnread < segment.unread) {
        return { ...segment, hasUnread: true }
      }

      return segment
    })

    return (
      <Flex mx={-2} flexWrap={'wrap'} justifyContent="center">
        <Col>
          <Toolbar>
            <Heading>Campaigns</Heading>
            <NavLink
              ml="auto"
              onClick={() =>
                this.setState({
                  addCampaignPopupOpen: true,
                  campaignSegment: Object.values(this.props.segments)[0].name,
                })
              }
            >
              <FA name="plus-circle" size="2x" />
            </NavLink>
          </Toolbar>
          <Tabs>
            <WideTab
              borderColor={this.state.showSent ? 'blue' : 'white'}
              onClick={() => this.setState({ showSent: true })}
            >
              SENT
            </WideTab>
            <WideTab
              borderColor={!this.state.showSent ? 'blue' : 'white'}
              onClick={() => this.setState({ showSent: false })}
            >
              UNSENT
            </WideTab>
          </Tabs>
          {Object.values(this.props.campaigns).map(
            campaign =>
              campaign.sent === this.state.showSent ? (
                <CampaignCard
                  key={campaign._id}
                  title={campaign.title}
                  message={campaign.message}
                  segmentName={R.path(
                    ['segments', campaign.segmentId, 'name'],
                    this.props,
                  )}
                  onPress={() => this.props.goToCampaign(campaign._id)}
                />
              ) : null,
          )}
        </Col>
        <Col>
          <Toolbar>
            <Heading>Segments</Heading>
            <NavLink
              ml="auto"
              onClick={() =>
                this.setState({
                  addSegmentPopupOpen: true,
                  segmentName: '',
                  segmentFile: {},
                })
              }
            >
              <FA name="plus-circle" size="2x" />
            </NavLink>
          </Toolbar>
          {segments.map(segment => (
            <SegmentCard
              key={segment._id}
              name={segment.name}
              hasUnread={segment.hasUnread}
              lastCampaignName="Test Campaign"
              numMembers={segment.numMembers}
              numUnread={segment.unread}
              onPress={() => this.props.goToSegment(segment._id)}
            />
          ))}
        </Col>
        {this.renderAddCampaignPopup()}
        {this.renderAddSegmentPopup()}
      </Flex>
    )
  }
}

const mapStateToProps = state => ({
  campaigns: state.campaigns,
  segments: state.segments,
})

const mapDispatchToProps = {
  goToCampaign: id => push(`/campaign/${id}`),
  goToSegment: id => push(`/segment/${id}`),
  addSegment: (name, members = []) => ({
    type: 'ADD_SEGMENT',
    payload: {
      name,
      members: members.filter(m => !!m.firstName && !!m.lastName && !!m.phone),
    },
  }),
  addCampaign: ({ title, message, segmentId, mediaUrl }) => ({
    type: 'ADD_CAMPAIGN',
    payload: { title, message, segmentId, mediaUrl },
  }),
  // goToCampaign: id => ({ type: "GO_TO_CAMPAIGN", payload: id })
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)

/**
 * COMPONENTS
 */

const Col = styled(Box)`
  max-width: 600px;
`
Col.defaultProps = {
  width: [1, 1, 1 / 2],
  px: 2,
}

const WideTab = styled(Tab)`
  width: 50%;
  text-align: center;
`
