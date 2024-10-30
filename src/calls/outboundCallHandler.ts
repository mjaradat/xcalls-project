// src/calls/outboundCallHandler.ts
import { UserAgent, Inviter, SessionState } from 'sip.js'
import { useCallStore } from '../stores/callStore'

export async function initiateOutboundCall(userAgent: UserAgent, targetURI: string, audioElement: HTMLAudioElement) {
  const callStore = useCallStore()
  callStore.startCall()

  const inviter = new Inviter(userAgent, UserAgent.makeURI(targetURI)!)

  inviter.stateChange.addListener(newState => {
    switch (newState) {
      case SessionState.Established:
        console.log('initiateOutboundCall', newState)
        callStore.callStatus = 'in progress'
        setupOutboundAudio(audioElement)
        break
      case SessionState.Terminated:
        console.log('initiateOutboundCall', newState)
        callStore.endCall('answered')
        break
    }
  })

  function setupOutboundAudio(audioElement: HTMLAudioElement) {
    inviter.sessionDescriptionHandler?.on('trackAdded', () => {
      const pc = inviter.sessionDescriptionHandler?.peerConnection
      const remoteStream = new MediaStream()

      pc?.getReceivers().forEach((receiver: RTCRtpReceiver) => {
        if (receiver.track) remoteStream.addTrack(receiver.track)
      })

      audioElement.srcObject = remoteStream
    })
  }

  await inviter.invite()
  return inviter
}
