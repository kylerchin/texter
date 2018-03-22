import produce from 'immer'
import * as R from 'ramda'

export const campaigns = (state = {}, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'LOAD_CAMPAIGNS':
        action.payload.forEach(campaign => (draft[campaign._id] = campaign))
        break
      case 'ADD_CAMPAIGN_SUCCESS':
        draft[action.payload._id] = action.payload
        break
      case 'EDIT_CAMPAIGN':
        Object.assign(draft[action.payload.campaignId], action.payload.campaign)
        break
      case 'DELETE_CAMPAIGN':
        delete draft[action.payload]
        break
      case 'LAUNCH_CAMPAIGN':
        draft[action.payload].sent = true
        break
      default:
        break
    }
  })

export const segments = (state = {}, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'LOAD_MESSAGES':
        {
          const segment = draft[action.payload.segmentId]
          segment.messages = R.map(
            val =>
              R.sort((a, b) => a.timestamp - b.timestamp, Object.values(val)),
            action.payload.messages,
          )
        }
        break
      case 'LOAD_SEGMENTS':
        action.payload.forEach(segment => (draft[segment._id] = segment))
        break
      case 'LOAD_SEGMENT_MEMBERS':
        {
          const members = (draft[action.payload.id].members = {})
          action.payload.data.forEach(member => (members[member._id] = member))
        }
        break
      case 'ADD_MEMBER_SUCCESS':
        {
          const segment = draft[action.payload.segmentId]
          segment.members[action.payload.data._id] = action.payload.data
        }
        break
      case 'DELETE_MEMBER':
        {
          const segment = draft[action.payload.segmentId]
          delete segment.members[action.payload.memberId]
        }
        break
      case 'EDIT_MEMBER':
        {
          const segment = draft[action.payload.segmentId]
          segment.members[action.payload.memberId] = {
            ...segment.members[action.payload.memberId],
            ...action.payload.member,
          }
        }
        break
      case 'MESSAGE_MEMBER':
        {
          const segment = draft[action.payload.segmentId]
          segment.messages[action.payload.memberId].push({
            from: 'texter',
            body: action.payload.message,
          })
        }
        break
      case 'EDIT_SEGMENT':
        {
          const segment = draft[action.payload.segmentId]
          segment.name = action.payload.segment.name
        }
        break
      case 'DELETE_SEGMENT':
        delete draft[action.payload]
        break
      case 'ADD_SEGMENT_SUCCESS':
        draft[action.payload._id] = action.payload
        break
      default:
        break
    }
  })

export const app = (state = { screen: 'HOME', screenParams: null }, action) =>
  produce(state, draft => {
    switch (action.type) {
      case 'GO_HOME':
        draft.screen = 'HOME'
        break
      case 'GO_TO_CAMPAIGN':
        draft.screen = 'CAMPAIGN'
        draft.screenParams = { id: action.payload }
        break
      default:
        break
    }
  })
