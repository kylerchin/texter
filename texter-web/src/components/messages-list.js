import React from 'react'
import ReactDOM from 'react-dom'
import { Flex, Box, Card, Text, Panel, ButtonTransparent, Input } from 'rebass'
import styled from 'styled-components'
import FA from 'react-fontawesome'
import * as R from 'ramda'
import { ChatFeed, Message } from 'react-chat-ui'
import { truncate, collateBy } from '../util'

const Span = styled(Text)``
Span.defaultProps = {
  is: 'span',
}

const InboxItemRow = styled(Card)`
  /* display: flex;
  flex-direction: row;
  margin-bottom: 4px;
  border-bottom: 1px solid rgb(238, 238, 238);
  padding-bottom: 4px;
  align-items: center; */
  margin-bottom: 4px;
  background-color: ${props =>
    props.selected ? '#aaa' : props.replied ? '#ddd' : 'white'};
`

const SidePanel = styled(Box)`
  border-right: 1px solid rgb(238, 238, 238);
  overflow-y: auto;
  height: 90%;
`

const InboxItem = ({ member, replied, lastMessage, onClick, selected }) => {
  return (
    <InboxItemRow replied={replied} selected={selected} onClick={onClick}>
      <Text style={{ fontWeight: 'bold' }}>{`${member.firstName} ${
        member.lastName
      } — ${member.phone}`}</Text>
      <Text>{`${truncate(lastMessage.body, 60)}`}</Text>
    </InboxItemRow>
  )
}

export default class MessagesList extends React.Component {
  constructor(props) {
    super(props)

    const selectedConvo = Object.keys(props.messages || {})[0] || ''
    const messages = R.path(['messages', selectedConvo], props)
    this.state = {
      chatPanelOpen: false,
      messageField: '',
      selectedConvo,
      messages: this.processMessages(messages),
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      !prevProps.messages ||
      (prevProps.messages[prevState.selectedConvo] !==
        this.props.messages[this.state.selectedConvo] &&
        !!this.props.messages[this.state.selectedConvo])
    ) {
      const messages = this.props.messages[this.state.selectedConvo]
      const processedMessages = this.processMessages(messages)
      const chatContainer = ReactDOM.findDOMNode(this.chatContainer)
      chatContainer.scrollTop = chatContainer.scrollHeight + 1000
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight
      this.setState({
        messages: processedMessages,
      })
    }
  }

  processMessages(messages = {}) {
    const msgs = Object.values(messages)

    const map = ms =>
      R.map(
        message =>
          new Message({
            id: !message.from || message.from === 'texter' ? 0 : 1,
            message: message.body,
            timestamp: message.timestamp,
          }),
        ms,
      )

    return map(msgs)
  }

  processConvos() {
    const collateByReplied = collateBy(
      x => x.messages[x.messages.length - 1].from === 'texter',
    )((a = [], b) => [...a, b])

    const collation = collateByReplied(
      Object.entries(this.props.messages || {}).map(entry => ({
        id: entry[0],
        member: this.props.members[entry[0]] || {},
        messages: entry[1],
      })),
    )

    return {
      replied: collation.get(true) || [],
      unreplied: collation.get(false) || [],
    }
  }

  render() {
    const { messages, sendMessage, members, deleteConvo } = this.props

    if (!messages || !members || !sendMessage) {
      return null
    }

    const { replied, unreplied } = this.processConvos()
    console.log('collation', replied, unreplied)
    const member = members[this.state.selectedConvo]

    return (
      <Flex style={{ height: '100%' }}>
        <SidePanel
          w={this.state.chatPanelOpen ? [0, 0.2, 0.3] : [1, 0.8, 0.5, 0.3]}
          onClick={() => this.setState({ chatPanelOpen: false })}
        >
          <Panel.Header>Unreplied</Panel.Header>
          {unreplied.map(convo => (
            <InboxItem
              replied={false}
              key={convo.member._id}
              onClick={e => {
                e.stopPropagation()
                this.setState({ selectedConvo: convo.id, chatPanelOpen: true })
              }}
              selected={convo.id === this.state.selectedConvo}
              member={convo.member}
              lastMessage={convo.messages[convo.messages.length - 1]}
            />
          ))}
          <Panel.Header>Replied</Panel.Header>
          {replied.map(convo => (
            <InboxItem
              replied={true}
              key={convo.member._id}
              onClick={e => {
                e.stopPropagation()
                this.setState({ selectedConvo: convo.id, chatPanelOpen: true })
              }}
              selected={convo.id === this.state.selectedConvo}
              member={convo.member}
              lastMessage={convo.messages[convo.messages.length - 1]}
            />
          ))}
        </SidePanel>
        <Box
          w={this.state.chatPanelOpen ? [1, 0.8, 0.7] : [0, 0.2, 0.5, 0.7]}
          style={{ height: '90%', overflowX: 'hidden' }}
          onClick={() => this.setState({ chatPanelOpen: true })}
        >
          <Flex px={2} flexDirection="column" style={{ height: '100%' }}>
            <Panel.Header
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <ButtonTransparent
                onClick={e => {
                  e.stopPropagation()
                  this.setState({ chatPanelOpen: false })
                }}
              >
                <FA name="arrow-left" />
              </ButtonTransparent>
              {!!member && (
                <React.Fragment>
                  <Text is="span">{`${member.firstName} ${member.lastName} — ${
                    member.phone
                  }`}</Text>
                </React.Fragment>
              )}
              <Box flex={1} />
              <ButtonTransparent
                onClick={() => deleteConvo(this.state.selectedConvo)}
                color="red"
              >
                <FA name="minus-circle" size="2x" />
              </ButtonTransparent>
            </Panel.Header>
            <Box
              ref={el => (this.chatContainer = el)}
              flex={1}
              style={{ overflowY: 'auto' }}
            >
              <ChatFeed messages={this.state.messages} />
            </Box>
            <Flex alignItems="center">
              <Box flex={1}>
                <Input
                  value={this.state.messageField}
                  onChange={e =>
                    this.setState({ messageField: e.target.value })
                  }
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      sendMessage(
                        members[this.state.selectedConvo]._id,
                        this.state.messageField,
                      )
                      this.setState({ messageField: '' })
                    }
                  }}
                />
              </Box>
              <Box>
                <ButtonTransparent
                  color="blue"
                  onClick={e => {
                    sendMessage(
                      members[this.state.selectedConvo]._id,
                      this.state.messageField,
                    )
                    this.setState({ messageField: '' })
                  }}
                >
                  <FA name="paper-plane" size="2x" />
                </ButtonTransparent>
              </Box>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    )
  }
}
