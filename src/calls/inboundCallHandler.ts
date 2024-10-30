// src/calls/inboundCallHandler.ts
import { Invitation, SessionState } from 'sip.js'
import { useCallStore } from '../stores/callStore'

export function handleInboundCall(invitation: Invitation, audioElement: HTMLAudioElement) {
  const callStore = useCallStore()
  callStore.startCall()

  invitation.stateChange.addListener(newState => {
    switch (newState) {
      case SessionState.Established:
        console.log('🚀 setupInboundAudio ', newState)
        callStore.callStatus = 'in progress'
        setupInboundAudio(audioElement)
        break
      case SessionState.Terminated:
        console.log('🚀 setupInboundAudio ', newState)
        callStore.endCall('answered')
        break
    }
  })

  const setupInboundAudio = (audioElement: HTMLAudioElement) => {
    invitation.sessionDescriptionHandler?.on('trackAdded', () => {
      const pc = invitation.sessionDescriptionHandler?.peerConnection
      const remoteStream = new MediaStream()

      pc?.getReceivers().forEach((receiver: RTCRtpReceiver) => {
        if (receiver.track) remoteStream.addTrack(receiver.track)
      })

      audioElement.srcObject = remoteStream
    })
  }

  return {
    answer: () => invitation.accept(),
    reject: () => {
      invitation.reject()
      callStore.endCall('rejected')
    }
  }
}
