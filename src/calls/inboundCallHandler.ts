// src/calls/inboundCallHandler.ts
import { Invitation, SessionState } from "sip.js";
import { useCallStore } from "../stores/callStore";

export function handleInboundCall(
  invitation: Invitation,
  audioElement: HTMLAudioElement
) {
  const callStore = useCallStore();
  callStore.setCallSession(invitation);
  callStore.updateCallState(SessionState.Establishing);

  invitation.stateChange.addListener((newState) => {
    callStore.updateCallState(newState);
    if (newState === SessionState.Established) {
      console.log("Inbound call established");
      setupInboundAudio(invitation, audioElement);
    } else if (newState === SessionState.Terminated) {
      callStore.resetCall();
      console.log("Inbound call ended");
    }
  });

  invitation
    .accept({
      sessionDescriptionHandlerOptions: {
        constraints: { audio: true, video: false },
      },
    })
    .catch((error) => console.error("Failed to accept inbound call:", error));
}

function setupInboundAudio(
  invitation: Invitation,
  audioElement: HTMLAudioElement
) {
  invitation.sessionDescriptionHandler?.on("trackAdded", () => {
    const pc = invitation.sessionDescriptionHandler?.peerConnection;
    const remoteStream = new MediaStream();

    pc?.getReceivers().forEach((receiver) => {
      if (receiver.track) remoteStream.addTrack(receiver.track);
    });

    audioElement.srcObject = remoteStream;
  });
}
