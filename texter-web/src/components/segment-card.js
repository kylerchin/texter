import React from 'react'
import { Flex, Box, Card, Badge, Text, Subhead, Small } from 'rebass'
import FA from 'react-fontawesome'

export default ({
  onPress,
  name,
  lastCampaignName,
  numMembers,
  numUnread,
  hasUnread,
}) => {
  return (
    <Box p={2} onClick={onPress}>
      <Card style={{ position: 'relative', overflow: 'visible' }}>
        <Flex>
          <Box flex="1">
            <Subhead>{name}</Subhead>
            <Text>{lastCampaignName}</Text>
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column' }}>
            <Small style={{ display: 'block', flex: 1 }}>
              <Small pr={2}>{numMembers}</Small>
              <FA name="users" />
            </Small>
            <Badge>
              <Small pr={2}>{numUnread}</Small>
              <FA name="envelope" />
            </Badge>
          </Box>
        </Flex>
        {hasUnread && (
          <FA
            name="exclamation-circle"
            style={{
              position: 'absolute',
              top: -5,
              left: -5,
              color: 'orange',
            }}
          />
        )}
      </Card>
    </Box>
  )
}
