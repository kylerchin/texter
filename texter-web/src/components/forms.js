import React from 'react'
import {
  Box,
  Small,
  Text,
  Button,
  Select,
  Textarea as RbTextarea,
} from 'rebass'
import ReactFileReader from 'react-file-reader'

export const Dropdown = ({ options, value, onChange }) => (
  <Select value={value} onChange={onChange}>
    {options.map(option => <option key={option}>{option}</option>)}
  </Select>
)

export const Textarea = ({ value, onChange }) => (
  <Box>
    <RbTextarea value={value} onChange={onChange} />
    <Small>{`${value.length} / 160`}</Small>
  </Box>
)

export const FileInput = ({ value, onChange }) => (
  <ReactFileReader fileTypes={['.csv']} handleFiles={onChange}>
    <Box>
      <Text>{value && value.fileName}</Text>
      <Button>Upload</Button>
    </Box>
  </ReactFileReader>
)
