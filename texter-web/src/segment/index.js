import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Flex,
  Box,
  Text,
  Card,
  Heading,
  Badge,
  ButtonTransparent,
  Tabs,
  Tab,
  Subhead,
  Row,
  Column,
} from 'rebass'
import FA from 'react-fontawesome'
import styled from 'styled-components'
import * as R from 'ramda'
import { push } from 'react-router-redux'

import BackButton from '../components/back-button'
import { ConfirmPopup, FormPopup } from '../components/popups'
import MembersList from '../components/members-list'
import MessagesList from '../components/messages-list'

const TABS = {
  MEMBERS: 'MEMBERS',
  MESSAGES: 'MESSAGES',
}

class Segment extends Component {
  state = {
    tab: TABS.MEMBERS,
    deletePopupOpen: false,
    editPopupOpen: false,
    addPopupOpen: false,
    deleteSegmentPopupOpen: false,
    editSegmentPopupOpen: false,
    segmentNameField: null,
    firstNameField: null,
    lastNameField: null,
    phoneField: null,
    memberId: null,
    loading: false,
  }

  getMemberFields() {
    return [
      {
        name: 'First Name',
        value: this.state.firstNameField,
        update: e => this.setState({ firstNameField: e.target.value }),
      },
      {
        name: 'Last Name',
        value: this.state.lastNameField,
        update: e => this.setState({ lastNameField: e.target.value }),
      },
      {
        name: 'Phone',
        value: this.state.phoneField,
        update: e => this.setState({ phoneField: e.target.value }),
      },
    ]
  }

  showDeletePopup(memberId) {
    this.setState({ deletePopupOpen: true, memberId })
  }

  showEditPopup(memberId) {
    const member = this.props.segment.members[memberId]
    this.setState({
      editPopupOpen: true,
      memberId,
      firstNameField: member.firstName,
      lastNameField: member.lastName,
      phoneField: member.phone,
    })
  }

  showAddPopup() {
    this.setState({
      addPopupOpen: true,
      firstNameField: '',
      lastNameField: '',
      phoneField: '',
    })
  }

  showDeleteSegmentPopup() {
    this.setState({ deleteSegmentPopupOpen: true })
  }

  showEditSegmentPopup() {
    this.setState({
      editSegmentPopupOpen: true,
      segmentNameField: this.props.segment.name,
    })
  }

  renderAnalytics() {
    const { segment } = this.props

    const total = segment.messagesTotal || segment.numMembers
    const unknown = segment.messagesUnknown || 0
    const queued = segment.messagesQueued || 0
    const sent = segment.messagesSent || 0
    const failed = segment.messagesFailed || 0
    const delivered = segment.messagesDelivered || 0

    return (
      <Box>
        <Subhead>Analytics</Subhead>
        <Row mt={3}>
          <Column>{`Total: ${total}`}</Column>
          <Column>{`Unknown: ${unknown}`}</Column>
          <Column>{`Queued: ${queued}`}</Column>
          <Column>{`Sent: ${sent}`}</Column>
          <Column>{`Failed: ${failed}`}</Column>
          <Column>{`Delivered: ${delivered}`}</Column>
        </Row>
      </Box>
    )
  }

  renderDeletePopup() {
    const member = R.path(
      ['segment', 'members', this.state.memberId],
      this.props,
    )

    const closePopup = () =>
      this.setState({ deletePopupOpen: false, memberId: null })

    return (
      <ConfirmPopup
        active={this.state.deletePopupOpen}
        name={member && member.firstName}
        message={`Are you sure you want to delete ${member &&
          member.firstName}? All message history will be lost.`}
        onClose={closePopup}
        onConfirm={() =>
          this.props.deleteMember(this.state.memberId, this.props.segment._id)
        }
      />
    )
  }

  renderEditPopup() {
    const closePopup = () =>
      this.setState({
        editPopupOpen: false,
        memberId: null,
        firstNameField: null,
        lastNameField: null,
        phoneField: null,
      })

    return (
      <FormPopup
        active={this.state.editPopupOpen}
        fields={this.getMemberFields()}
        onClose={closePopup}
        onConfirm={() =>
          this.props.editMember(this.state.memberId, this.props.segment._id, {
            firstName: this.state.firstNameField,
            lastName: this.state.lastNameField,
            phone: this.state.phoneField,
          })
        }
        confirmText="Save"
      />
    )
  }

  renderAddPopup() {
    const closePopup = () =>
      this.setState({
        addPopupOpen: false,
        memberId: null,
        firstNameField: null,
        lastNameField: null,
        phoneField: null,
      })

    return (
      <FormPopup
        active={this.state.addPopupOpen}
        fields={this.getMemberFields()}
        onClose={closePopup}
        onConfirm={() =>
          this.props.addMember(this.props.segment._id, {
            firstName: this.state.firstNameField,
            lastName: this.state.lastNameField,
            phone: this.state.phoneField,
          })
        }
        confirmText="Add"
      />
    )
  }

  renderDeleteSegmentPopup() {
    const closePopup = () => this.setState({ deleteSegmentPopupOpen: false })

    return (
      <ConfirmPopup
        message={`Are you sure you want to delete ${
          this.props.segment.name
        }? All message history will be lost.`}
        active={this.state.deleteSegmentPopupOpen}
        onClose={closePopup}
        onConfirm={() => {
          this.props.deleteSegment(this.props.segment._id)
          this.props.goHome()
        }}
      />
    )
  }

  renderEditSegmentPopup() {
    const closePopup = () =>
      this.setState({
        editSegmentPopupOpen: false,
        segmentNameField: null,
      })

    return (
      <FormPopup
        active={this.state.editSegmentPopupOpen}
        fields={[
          {
            name: 'Name',
            value: this.state.segmentNameField,
            update: e => this.setState({ segmentNameField: e.target.value }),
          },
        ]}
        onClose={closePopup}
        onConfirm={() =>
          this.props.editSegment(this.props.segment._id, {
            name: this.state.segmentNameField,
          })
        }
        confirmText="Save"
      />
    )
  }

  render() {
    if (!this.props.segment) {
      return (
        <div className="App">
          <Text>Loading...</Text>
        </div>
      )
    }

    if (!this.state.loading && !this.props.segment.members) {
      this.setState({ loading: true }, () => {
        this.props.fetchMembers(this.props.segment._id)
      })
    }

    const { segment } = this.props

    localStorage.setItem(segment._id, segment.unread)

    return (
      <Flex justifyContent="center" style={{ height: '100%' }}>
        <Box
          style={{
            maxWidth: 1000,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
          width={1}
          p={3}
        >
          <BackButton onClick={this.props.goHome} />
          <Flex pb={2} flexDirection="row" alignItems="center">
            <Heading>{segment.name}</Heading>
            <Box flex={1} />
            <ButtonTransparent onClick={() => this.showEditSegmentPopup()}>
              <FA name="pencil" size="2x" />
            </ButtonTransparent>
            <ButtonTransparent onClick={() => this.showDeleteSegmentPopup()}>
              <FA name="minus-circle" size="2x" />
            </ButtonTransparent>
          </Flex>
          {this.renderAnalytics()}
          <Card
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Tabs style={{ minHeight: 40 }}>
              <WideTab
                mr={'auto'}
                w={1 / 2}
                borderColor={
                  this.state.tab === TABS.MESSAGES ? 'blue' : 'white'
                }
                onClick={() => this.setState({ tab: TABS.MESSAGES })}
              >
                {TABS.MESSAGES}
                {segment.unread !== 0 && (
                  <Badge bg="blue">{segment.unread}</Badge>
                )}
              </WideTab>
              <WideTab
                borderColor={this.state.tab === TABS.MEMBERS ? 'blue' : 'white'}
                onClick={() => this.setState({ tab: TABS.MEMBERS })}
              >
                {TABS.MEMBERS}
              </WideTab>
            </Tabs>
            {this.state.tab === TABS.MEMBERS ? (
              <MembersList
                members={Object.values(segment.members || {})}
                onEdit={id => this.showEditPopup(id)}
                onDelete={id => this.showDeletePopup(id)}
                onAdd={() => this.showAddPopup()}
              />
            ) : (
              <MessagesList
                messages={segment.messages}
                members={segment.members}
                sendMessage={(memberId, message) =>
                  this.props.messageMember(segment._id, memberId, message)
                }
                deleteConvo={memberId =>
                  this.props.deleteConvo(segment._id, memberId)
                }
              />
            )}
          </Card>
        </Box>
        {this.renderDeletePopup()}
        {this.renderEditPopup()}
        {this.renderAddPopup()}
        {this.renderDeleteSegmentPopup()}
        {this.renderEditSegmentPopup()}
      </Flex>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  segment: state.segments[ownProps.match.params.id],
  // segments: state.segments,
})

const mapDispatchToProps = {
  fetchMembers: id => ({ type: 'FETCH_SEGMENT_MEMBERS', payload: id }),
  deleteMember: (memberId, segmentId) => ({
    type: 'DELETE_MEMBER',
    payload: { memberId, segmentId },
  }),
  editMember: (memberId, segmentId, member) => ({
    type: 'EDIT_MEMBER',
    payload: { memberId, segmentId, member },
  }),
  addMember: (segmentId, member) => ({
    type: 'ADD_MEMBER',
    payload: { segmentId, member },
  }),
  messageMember: (segmentId, memberId, message) => ({
    type: 'MESSAGE_MEMBER',
    payload: { segmentId, memberId, message },
  }),
  deleteConvo: (segmentId, memberId) => ({
    type: 'DELETE_CONVO',
    payload: { segmentId, memberId },
  }),
  deleteSegment: segmentId => ({
    type: 'DELETE_SEGMENT',
    payload: segmentId,
  }),
  editSegment: (segmentId, segment) => ({
    type: 'EDIT_SEGMENT',
    payload: {
      segmentId,
      segment,
    },
  }),
  goHome: () => push('/'),
}

export default connect(mapStateToProps, mapDispatchToProps)(Segment)

/**
 * COMPONENTS
 */

const WideTab = styled(Tab)`
  width: 50%;
  text-align: center;
`
