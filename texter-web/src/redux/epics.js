import { of } from 'rxjs/observable/of'
import { fromPromise } from 'rxjs/observable/fromPromise'
import { merge, mergeMap } from 'rxjs/operators'
import { service } from '../App'
import { combineEpics } from 'redux-observable'
import 'rxjs'

const log = action$ =>
  action$.mergeMap(action => {
    console.log('action: ', action)
    return of()
  })

const members = action$ =>
  action$.ofType('FETCH_SEGMENT_MEMBERS').pipe(
    mergeMap(action => {
      const members$ = fromPromise(
        service.backend.get(`/segments/${action.payload}/members`),
      )
        .map(result => result.data)
        .map(data => ({
          type: 'LOAD_SEGMENT_MEMBERS',
          payload: {
            id: action.payload,
            data,
          },
        }))

      const messages$ = service.firebase
        .ref(`segments/${action.payload}/messages`)
        .onValue()
        .map(snapshot => snapshot.val())
        .map(value => ({
          type: 'LOAD_MESSAGES',
          payload: { segmentId: action.payload, messages: value },
        }))

      return members$.pipe(merge(messages$))
    }),
  )

const deleteConvo = action$ =>
  action$.ofType('DELETE_CONVO').mergeMap(({ payload }) => {
    service.firebase
      .ref(`segments/${payload.segmentId}/messages/${payload.memberId}`)
      .remove()

    return of()
  })

const addMember = action$ =>
  action$.ofType('ADD_MEMBER').mergeMap(({ payload }) => {
    const response$ = fromPromise(
      service.backend.post(
        `/segments/${payload.segmentId}/members`,
        payload.member,
      ),
    )
      .map(result => ({
        type: 'ADD_MEMBER_SUCCESS',
        payload: {
          segmentId: payload.segmentId,
          data: { ...result.data, segmentId: payload.segmentId },
        },
      }))
      .catch(error => ({ type: 'ADD_MEMBER_ERROR', error }))

    return response$
  })

const deleteMember = action$ =>
  action$.ofType('DELETE_MEMBER').mergeMap(({ payload }) => {
    service.backend.delete(
      `/segments/${payload.segmentId}/members/${payload.memberId}`,
    )
    return of()
  })

const editMember = action$ =>
  action$.ofType('EDIT_MEMBER').mergeMap(({ payload }) => {
    console.log('editing member')
    service.backend.patch(
      `/segments/${payload.segmentId}/members/${payload.memberId}`,
      payload.member,
    )
    return of()
  })

const messageMember = action$ =>
  action$.ofType('MESSAGE_MEMBER').mergeMap(({ payload }) => {
    const response$ = fromPromise(
      service.backend.post(
        `/segments/${payload.segmentId}/members/${payload.memberId}/messages`,
        { message: payload.message },
      ),
    )
      .map(result => ({ type: 'MESSAGE_MEMBER_SUCCESS', payload }))
      .catch(error => ({ type: 'MESSAGE_MEMBER_ERROR', error, payload }))

    return response$
  })

const addSegment = action$ =>
  action$.ofType('ADD_SEGMENT').mergeMap(({ payload }) => {
    const response$ = fromPromise(
      service.backend.post(`/segments`, payload),
    ).map(result => ({
      type: 'ADD_SEGMENT_SUCCESS',
      payload: result.data,
    }))
    // .catch(error => ({ type: 'ADD_SEGMENT_ERROR', error, payload }))

    return response$
  })

const addCampaign = action$ =>
  action$.ofType('ADD_CAMPAIGN').mergeMap(({ payload }) => {
    return fromPromise(
      service.backend.post(`/campaigns`, { ...payload, sent: false }),
    ).map(result => ({
      type: 'ADD_CAMPAIGN_SUCCESS',
      payload: result.data,
    }))
    // .catch(error => ({ type: 'ADD_CAMPAIGN_ERROR', error, payload }))
  })

const editSegment = action$ =>
  action$.ofType('EDIT_SEGMENT').mergeMap(({ payload }) => {
    service.backend.patch(`/segments/${payload.segmentId}`, payload.segment)
    return of()
  })

const editCampaign = action$ =>
  action$.ofType('EDIT_CAMPAIGN').mergeMap(({ payload }) => {
    service.backend.patch(`/campaigns/${payload.campaignId}`, payload.campaign)
    return of()
  })

const deleteSegment = action$ =>
  action$.ofType('DELETE_SEGMENT').mergeMap(({ payload }) => {
    service.backend.delete(`/segments/${payload}`)
    return of()
  })

const deleteCampaign = action$ =>
  action$.ofType('DELETE_CAMPAIGN').mergeMap(({ payload }) => {
    service.backend.delete(`/campaigns/${payload}`)
    return of()
  })

const launchCampaign = action$ =>
  action$.ofType('LAUNCH_CAMPAIGN').mergeMap(({ payload }) => {
    service.backend.post(`/campaigns/${payload}/launch`)
    return of()
  })

const init = action$ =>
  action$.ofType('INIT').pipe(
    mergeMap(action => {
      // const messages$ = fromPromise(
      //   service.firebase.ref('messages').once('value'),
      // )
      //   .map(snapshot => snapshot.val())
      //   .map(value => ({ type: 'LOAD_MESSAGES', payload: value }))
      const campaigns$ = fromPromise(service.backend.get('/campaigns'))
        .map(result => result.data)
        .map(data => ({ type: 'LOAD_CAMPAIGNS', payload: data }))
      const segments$ = fromPromise(service.backend.get('/segments'))
        .map(result => result.data)
        .map(data => ({ type: 'LOAD_SEGMENTS', payload: data }))

      return campaigns$.pipe(merge(segments$))
    }),
  )

export const rootEpic = combineEpics(
  log,
  init,
  members,
  messageMember,
  deleteMember,
  editMember,
  editCampaign,
  deleteCampaign,
  addMember,
  addSegment,
  addCampaign,
  editSegment,
  deleteSegment,
  launchCampaign,
  deleteConvo,
)
