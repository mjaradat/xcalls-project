<template>
  <div id="app">
    <h1>Audio Call App</h1>

    callState: {{ callState }} <br />
    callSession: {{ callSession }} <br />
    isInCall: {{ isInCall }} <br />
    <div v-if="!isConnected">
      <button @click="connect">Connect to SIP Server</button>
    </div>
    <div v-else>
      <DialPad :onCall="makeCall" />
      <button v-if="isInCall" @click="endCall">End Call</button>
      <p v-if="callState">Call Status: {{ callState }}</p>
    </div>
    <audio ref="audioElement" autoplay></audio>
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, Ref, ref, toRefs } from "vue";
import { useCallStore } from "./stores/callStore";
import { initiateOutboundCall } from "./calls/outboundCallHandler";
import { handleInboundCall } from "./calls/inboundCallHandler";
import { Invitation, Registerer, UserAgent } from "sip.js";

const callStore = useCallStore();

const { isInCall, callState, callSession } = toRefs(callStore);
const isConnected = ref(false);
const targetNumber = ref("");
const ua = ref(null) as Ref<UserAgent | null>;
const audioElement = ref(null) as Ref<HTMLAudioElement | null>;

const connect = () => {
  const configuration = {
    uri: UserAgent.makeURI("sip:101@sip.xtrevo.com"),
    transportOptions: {
      server: "wss://sip.xtrevo.com:8443/asterisk-wss",
    },
    authorizationUsername: "101",
    authorizationPassword: "severalleddepend8912@@",
  };

  ua.value = new UserAgent(configuration);
  ua.value.start();

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

  ua.value.delegate = {
    onInvite: (invitation: Invitation) => {
      if (audioElement.value) handleInboundCall(invitation, audioElement.value);
    },
  };
};

const makeCall = (target: string) => {
  targetNumber.value = target;
  if (!ua.value || !audioElement.value) return;
  const targetURI = `sip:${target}@sip.xtrevo.com`;
  initiateOutboundCall(ua.value, targetURI, audioElement.value);
};

const endCall = () => {
  callStore.resetCall();
};

const DialPad = defineAsyncComponent(() => import("./components/DialPad.vue"));
const CounterComponent = defineAsyncComponent(
  () => import("./components/CounterComponent.vue")
);
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 60px;
}
</style>
