import React from 'react'
import { Flex, Box, Card, Badge, Text, Subhead, Small } from 'rebass'
import FA from 'react-fontawesome'

export default ({ onPress, name, lastCampaignName, numMembers, numUnread }) => {
  return (
    <Box p={2} onClick={onPress}>
      <Card>
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
      </Card>
    </Box>
  )
}
