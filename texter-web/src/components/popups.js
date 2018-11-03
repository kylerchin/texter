import React from 'react'
import { Flex, Text, Button, Label, Input } from 'rebass'

import Popup from './popup'
import { Dropdown, Textarea, FileInput } from './forms'

export const FIELD_TYPE = {
  TEXT: 'TEXT',
  DROPDOWN: 'DROPDOWN',
  TEXTAREA: 'TEXTAREA',
  FILE: 'FILE',
}

const Field = {
  [FIELD_TYPE.TEXT]: Input,
  [FIELD_TYPE.DROPDOWN]: Dropdown,
  [FIELD_TYPE.TEXTAREA]: Textarea,
  [FIELD_TYPE.FILE]: FileInput,
}

export const ConfirmPopup = ({
  message,
  active,
  onClose,
  onConfirm,
  confirmText,
  confirmColor,
}) => (
  <Popup active={active} close={onClose}>
    <Text p={3} textAlign="center">
      {message}
    </Text>
    <Flex pt={3} justifyContent="flex-end">
      <Button
        mr={2}
        bg={confirmColor || 'red'}
        onClick={() => {
          onConfirm()
          onClose()
        }}
      >
        {confirmText || 'Delete'}
      </Button>
      <Button bg="#aaa" onClick={onClose}>
        Cancel
      </Button>
    </Flex>
  </Popup>
)

export const FormPopup = ({
  active,
  fields,
  onClose,
  onConfirm,
  confirmText,
}) => (
  <Popup active={active} close={onClose}>
    {fields.map(field => {
      const InputComponent = Field[field.type || FIELD_TYPE.TEXT]
      return (
        <React.Fragment key={field.name}>
          <Label mt={3}>{field.name}</Label>
          <InputComponent
            value={field.value}
            onChange={field.update}
            options={field.options}
          />
        </React.Fragment>
      )
    })}
    <Flex pt={3} justifyContent="flex-end">
      <Button
        mr={2}
        bg="#3a9"
        disabled={fields.some(field => !field.optional && !field.value)}
        onClick={() => {
          onConfirm()
          onClose()
        }}
      >
        {confirmText}
      </Button>
      <Button bg="#aaa" onClick={onClose}>
        Cancel
      </Button>
    </Flex>
  </Popup>
)
