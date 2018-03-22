import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Flex,
  Box,
  Text,
  Label,
  Subhead,
  Heading,
  Blockquote,
  Button,
  ButtonTransparent,
  Row,
  Column,
} from 'rebass'
import FA from 'react-fontawesome'
import * as R from 'ramda'
import { push } from 'react-router-redux'

import { ConfirmPopup, FormPopup, FIELD_TYPE } from './components/popups'
import BackButton from './components/back-button'
import { TWILIO } from './constants'
import { formatDuration } from './util'

class Campaign extends Component {
  state = {
    deletePopupOpen: false,
    editPopupOpen: false,
    launchPopupOpen: false,
    titleField: '',
    segmentField: '',
    messageField: '',
  }

  showDeletePopup() {
    this.setState({
      deletePopupOpen: true,
    })
  }

  showEditPopup() {
    this.setState({
      editPopupOpen: true,
      titleField: this.props.campaign.title,
      segmentField: this.props.segments[this.props.campaign.segmentId].name,
      messageField: this.props.campaign.message,
    })
  }

  showLaunchPopup() {
    this.setState({
      launchPopupOpen: true,
    })
  }

  renderDeletePopup() {
    const close = () => this.setState({ deletePopupOpen: false })

    return (
      <ConfirmPopup
        message={`Are you sure you want to delete ${
          this.props.campaign.title
        }?`}
        active={this.state.deletePopupOpen}
        onClose={close}
        onConfirm={() => {
          this.props.deleteCampaign(this.props.campaign._id)
          this.props.goHome()
        }}
      />
    )
  }

  renderEditPopup() {
    const close = () =>
      this.setState({
        editPopupOpen: false,
        titleField: '',
        segmentField: '',
        messageField: '',
      })

    return (
      <FormPopup
        active={this.state.editPopupOpen}
        fields={[
          {
            name: 'Title',
            value: this.state.titleField,
            update: e => this.setState({ titleField: e.target.value }),
          },
          {
            name: 'Segment',
            value: this.state.segmentField,
            update: e => this.setState({ segmentField: e.target.value }),
            type: FIELD_TYPE.DROPDOWN,
            options: Object.values(this.props.segments).map(s => s.name),
          },
          {
            name: 'Message',
            value: this.state.messageField,
            update: e => this.setState({ messageField: e.target.value }),
            type: FIELD_TYPE.TEXTAREA,
          },
        ]}
        onClose={close}
        onConfirm={() => {
          const segments = Object.values(this.props.segments)
          const seg = segments.find(s => s.name === this.state.segmentField)

          this.props.editCampaign(this.props.campaign._id, {
            title: this.state.titleField,
            message: this.state.messageField,
            segmentId: seg._id,
          })
        }}
        confirmText="Save"
      />
    )
  }

  renderLaunchPopup() {
    const close = () => this.setState({ launchPopupOpen: false })

    const campaign = this.props.campaign
    const segment = this.props.segments[this.props.campaign.segmentId]
    if (!segment) {
      return null
    }

    const reach = segment.numMembers
    const cost = (segment.numMembers * TWILIO.COST_PER_MESSAGE).toLocaleString(
      'en-US',
      { style: 'currency', currency: 'USD' },
    )
    const time = formatDuration(
      segment.numMembers / (TWILIO.NUMBERS * TWILIO.MESSAGES_PER_SECOND),
    )

    const launchMessage = `Are you sure you want to launch ${campaign.title}?\n
    Reach: ${reach} people
    Cost: ${cost}
    Time to send: ${time}`

    return (
      <ConfirmPopup
        message={launchMessage}
        active={this.state.launchPopupOpen}
        confirmText={`Launch`}
        confirmColor={`#3a9`}
        onClose={close}
        onConfirm={() => this.props.launchCampaign(campaign._id)}
      />
    )
  }

  renderAnalytics() {
    const segment = this.props.segments[this.props.campaign.segmentId]

    console.log('SEGMENT', this.props.segments)
    console.log('id', this.props.campaign._id)
    if (!this.props.campaign.sent || !segment) {
      return null
    }
    const sent = segment.numMembers
    const delivered = segment.messagesDelivered
    const failed = segment.messagesFailed
    const pending =
      segment.numMembers -
        (segment.messagesDelivered + segment.messagesFailed) || undefined

    return (
      <Box>
        <Subhead>Analytics</Subhead>
        <Row mt={3}>
          <Column>{`${sent} sent`}</Column>
          <Column>
            {delivered !== undefined ? `${delivered} delivered` : null}
          </Column>
          <Column>{failed !== undefined ? `${failed} failed` : null}</Column>
          <Column>{pending !== undefined ? `${pending} pending` : null}</Column>
        </Row>
      </Box>
    )
  }

  render() {
    if (!this.props.campaign) {
      return (
        <div className="App">
          <Text>Loading...</Text>
        </div>
      )
    }

    const { campaign } = this.props
    return (
      <Flex justifyContent="center" style={{ height: '100%' }}>
        <Box
          style={{
            maxWidth: 1000,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
          width={1}
          p={3}
        >
          <BackButton onClick={this.props.goHome} />
          <Flex pb={2} flexDirection="row" alignItems="center">
            <Heading>{campaign.title}</Heading>
            <Box flex={1} />
            {campaign.sent ? null : (
              <ButtonTransparent onClick={() => this.showEditPopup()}>
                <FA name="pencil" size="2x" />
              </ButtonTransparent>
            )}
            <ButtonTransparent onClick={() => this.showDeletePopup()}>
              <FA name="minus-circle" size="2x" />
            </ButtonTransparent>
          </Flex>
          <Subhead mt={3}>
            {`Segment: ${R.pathOr(
              'none',
              ['segments', campaign.segmentId, 'name'],
              this.props,
            )}`}
          </Subhead>
          <Label mt={3}>Message</Label>
          <Blockquote>{campaign.message}</Blockquote>
          <Box flex={1} />
          {this.renderAnalytics()}
          <Box flex={1} />
          <Flex pb={2} pt={4}>
            <Button
              bg="#3A9"
              style={{ width: '100%' }}
              disabled={campaign.sent}
              onClick={() => this.showLaunchPopup()}
            >
              <Heading>{campaign.sent ? 'SENT' : 'SEND'}</Heading>
            </Button>
          </Flex>
        </Box>
        {this.renderDeletePopup()}
        {this.renderEditPopup()}
        {this.renderLaunchPopup()}
      </Flex>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  campaign: state.campaigns[ownProps.match.params.id],
  segments: state.segments,
})

const mapDispatchToProps = {
  editCampaign: (campaignId, campaign) => ({
    type: 'EDIT_CAMPAIGN',
    payload: { campaignId, campaign },
  }),
  deleteCampaign: campaignId => ({
    type: 'DELETE_CAMPAIGN',
    payload: campaignId,
  }),
  launchCampaign: campaignId => ({
    type: 'LAUNCH_CAMPAIGN',
    payload: campaignId,
  }),
  goHome: () => push('/'),
}

export default connect(mapStateToProps, mapDispatchToProps)(Campaign)
