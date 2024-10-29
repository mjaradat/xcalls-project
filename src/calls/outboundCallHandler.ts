// src/calls/outboundCallHandler.ts
import { Inviter, SessionState, UserAgent } from "sip.js";
import { useCallStore } from "../stores/callStore";

export function initiateOutboundCall(
  ua: UserAgent,
  targetURI: string,
  audioElement: HTMLAudioElement
) {
  const callStore = useCallStore();
  const inviter = new Inviter(ua, UserAgent.makeURI(targetURI)!);
  callStore.setCallSession(inviter);
  callStore.updateCallState(SessionState.Establishing);

  inviter
    .invite({
      sessionDescriptionHandlerOptions: {
        constraints: { audio: true, video: false },
      },
    })
    .then(() => {
      inviter.stateChange.addListener((newState) => {
        callStore.updateCallState(newState);
        if (newState === SessionState.Established) {
          console.log("Outbound call established");
          setupOutboundAudio(inviter, audioElement);
        } else if (newState === SessionState.Terminated) {
          callStore.resetCall();
          console.log("Outbound call ended");
        }
      });
    })
    .catch((error) => console.error("Failed to make outbound call:", error));
}

function setupOutboundAudio(inviter: Inviter, audioElement: HTMLAudioElement) {
  inviter.sessionDescriptionHandler?.on("trackAdded", () => {
    const pc = inviter.sessionDescriptionHandler?.peerConnection;
    const remoteStream = new MediaStream();

    pc?.getReceivers().forEach((receiver) => {
      if (receiver.track) remoteStream.addTrack(receiver.track);
    });

    audioElement.srcObject = remoteStream;
  });
}
