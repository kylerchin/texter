import React from 'react'
import { Flex, Box, Panel } from 'rebass'
import styled from 'styled-components'

const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
`

export default ({ active, children, close }) => {
  if (!active) {
    return null
  }

  return (
    <Background onClick={close}>
      <Flex
        style={{ height: '100%' }}
        justifyContent="center"
        alignItems="center"
      >
        <Box w={[0.9, 0.7, 0.5, 0.3]} style={{ maxWidth: 420 }}>
          <Panel onClick={e => e.stopPropagation()} p={2}>
            {children}
          </Panel>
        </Box>
      </Flex>
    </Background>
  )
}
