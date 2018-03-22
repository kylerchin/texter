import React from 'react'
import { Box, ButtonTransparent } from 'rebass'
import FA from 'react-fontawesome'

export default ({ onClick, disabled }) => (
  <Box mb={2}>
    <ButtonTransparent
      color="blue"
      mb={2}
      onClick={onClick}
      disabled={disabled}
    >
      <FA size="2x" name="arrow-left" />
    </ButtonTransparent>
  </Box>
)
