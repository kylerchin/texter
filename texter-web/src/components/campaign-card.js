import React from 'react'
import { Box, Text, Panel, Subhead } from 'rebass'

export default ({ onPress, title, segmentName, message, sent }) => {
  return (
    <Box p={2} onClick={onPress}>
      <Panel color="orange">
        <Panel.Header color="white" bg="orange">
          {title}
        </Panel.Header>
        <Box p={3}>
          <Subhead>{segmentName}</Subhead>
          <Text>{message}</Text>
        </Box>
      </Panel>
    </Box>
  )
}
