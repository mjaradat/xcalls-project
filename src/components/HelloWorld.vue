<template>
  <div id="app">
    <h1>Audio Call App</h1>
    <div v-if="!isConnected">
      <button @click="connect">Connect to SIP Server</button>
    </div>
    <div v-else>
      <input v-model="target" placeholder="Enter SIP target" />
      <button @click="makeCall">Call</button>
      <button v-if="callSession" @click="endCall">End Call</button>
    </div>
    <audio ref="audioElement" autoplay></audio>
  </div>
</template>

<script lang="ts" setu>
import { defineComponent, ref } from "vue";
import {
  UserAgent,
  Invitation,
  Inviter,
  Registerer,
  Session,
  SessionState,
  Web,
} from "sip.js";

export default defineComponent({
  name: "App",
  setup() {
    const isConnected = ref(false);
    const target = ref("");
    const ua = ref<UserAgent | null>(null);
    const callSession = ref<Inviter | null>(null);
    const audioElement = ref<HTMLAudioElement | null>(null);

    const connect = () => {
      const configuration = {
        uri: UserAgent.makeURI("sip:101@sip.xtrevo.com"), // Your SIP URI
        transportOptions: {
          server: "wss://sip.xtrevo.com:8443/asterisk-wss", // WebSocket URL
        },
        authorizationUsername: "101", // Your SIP Username
        authorizationPassword: "severalleddepend8912@@", // Your SIP Password
      };

      ua.value = new UserAgent(configuration);

      const registerer = new Registerer(ua.value);
      registerer
        .register()
        .then(() => {
          isConnected.value = true;
          console.log("Connected to SIP server");
        })
        .catch((error) => {
          console.error("Failed to register to SIP server:", error);
        });

      // Inbound Call Handling
      ua.value.delegate = {
        onInvite: (invitation: Invitation) => {
          handleInboundCall(invitation);
        },
      };
    };

    const handleInboundCall = (invitation: Invitation) => {
      // Set up audio handling for the incoming call
      invitation.sessionDescriptionHandler?.on("trackAdded", () => {
        const pc = invitation.sessionDescriptionHandler?.peerConnection;
        const remoteStream = new MediaStream();

        pc?.getReceivers().forEach((receiver) => {
          if (receiver.track) remoteStream.addTrack(receiver.track);
        });

        if (audioElement.value) {
          audioElement.value.srcObject = remoteStream;
        }
      });

      // Accept the call
      invitation
        .accept({
          sessionDescriptionHandlerOptions: {
            constraints: { audio: true, video: false },
          },
        })
        .then(() => {
          callSession.value = invitation; // Save the session for later use
          console.log("Incoming call accepted");
        })
        .catch((error) =>
          console.error("Failed to accept incoming call:", error)
        );
    };

    const makeCall = () => {
      if (!ua.value) return;
      const targetURI = `sip:${target.value}@sip.xtrevo.com`; // Set the target SIP URI

      // Create an Inviter for the outgoing call
      callSession.value = new Inviter(ua.value, UserAgent.makeURI(targetURI)!);

      callSession.value
        .invite({
          sessionDescriptionHandlerOptions: {
            constraints: { audio: true, video: false },
          },
        })
        .then(() => {
          // Listen for state changes to handle the audio stream once the call is accepted
          callSession.value?.stateChange.addListener((newState) => {
            if (newState === SessionState.Established) {
              console.log("Outbound call established");
              handleOutboundCall(callSession.value!);
            } else if (newState === SessionState.Terminated) {
              console.log("Outbound call terminated");
              callSession.value = null;
            }
          });
        })
        .catch((error) => console.error("Failed to make call:", error));
    };

    const handleOutboundCall = (session: Inviter) => {
      session.sessionDescriptionHandler?.on("trackAdded", () => {
        const pc = session.sessionDescriptionHandler?.peerConnection;
        const remoteStream = new MediaStream();

        pc?.getReceivers().forEach((receiver) => {
          if (receiver.track) remoteStream.addTrack(receiver.track);
        });

        if (audioElement.value) {
          audioElement.value.srcObject = remoteStream;
        }
      });
    };

    const endCall = () => {
      if (callSession.value) {
        callSession.value.cancel(); // Terminate using Inviter
        callSession.value = null;
        console.log("Call ended");
      }
    };

    return {
      isConnected,
      target,
      connect,
      makeCall,
      endCall,
      audioElement,
      callSession,
    };
  },
});
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 60px;
}
</style>
