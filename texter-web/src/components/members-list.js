import React from 'react'
import { Box, Text, Panel, Button } from 'rebass'
import styled from 'styled-components'
import FA from 'react-fontawesome'

const Span = styled(Text)``
Span.defaultProps = {
  is: 'span',
}

const MemberRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 4px;
  border-bottom: 1px solid rgb(238, 238, 238);
  padding-bottom: 4px;
  align-items: center;
`

const Member = ({ firstName, lastName, phone, onEdit, onDelete }) => {
  return (
    <MemberRow>
      <Text>{`${firstName} ${lastName} — ${phone}`}</Text>
      <Box flex={'1'} alignSelf="flex-end" style={{ textAlign: 'right' }}>
        <button onClick={onEdit}>
          <FA name="edit" size="2x" />
        </button>
        <button onClick={onDelete}>
          <FA name="minus-circle" size="2x" />
        </button>
      </Box>
    </MemberRow>
  )
}

export default ({ members, onEdit, onDelete, onAdd }) => {
  return (
    <Box
      p={2}
      style={{
        height: '100%',
      }}
    >
      <Panel style={{ height: '80%', overflowY: 'scroll' }}>
        {members.map(member => (
          <Member
            firstName={member.firstName}
            lastName={member.lastName}
            phone={member.phone}
            key={member._id}
            onEdit={() => onEdit(member._id)}
            onDelete={() => onDelete(member._id)}
          />
        ))}
      </Panel>
      <Panel.Footer>
        <Button bg="#3a9" onClick={onAdd}>
          Add
        </Button>
      </Panel.Footer>
    </Box>
  )
}
