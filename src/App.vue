<template>
  <div id="app">
    <h1>Call App</h1>

    <div v-if="!ua?.isConnected()">
      <button @click="connectToSIP">Connect</button>
    </div>
    <div v-else>
      <DialPad :onCall="makeOutboundCall" />
      <button v-if="isInCall" @click="endCurrentCall">End Call</button>
      <p v-if="callStatus">Call Status: {{ callStatus }}</p>
      <div v-if="incomingCall">
        <p>Incoming Call</p>
        <button @click="answerCall">Answer</button>
        <button @click="rejectCall">Reject</button>
      </div>
    </div>
    <h2>Call Logs</h2>
    <ul>
      <li v-for="log in callLogs" :key="log.startTime.toString()">{{ log.status }} ({{ log.duration }} seconds)</li>
    </ul>
    <audio ref="audioElement" autoplay></audio>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue'
import { UserAgent, Invitation } from 'sip.js'
import { useCallStore } from './stores/callStore'
import { initiateOutboundCall } from './calls/outboundCallHandler'
import { handleInboundCall } from './calls/inboundCallHandler'
import DialPad from './components/DialPad.vue'

export default defineComponent({
  name: 'App',
  components: { DialPad },
  setup() {
    const callStore = useCallStore()
    const incomingCall = ref(null as any)
    const ua = ref(null) as Ref<UserAgent | null>
    const audioElement = ref(null) as Ref<HTMLAudioElement | null>

    const connectToSIP = () => {
      const configuration = {
        uri: UserAgent.makeURI('sip:101@sip.xtrevo.com'),
        transportOptions: {
          server: 'wss://sip.xtrevo.com:8443/asterisk-wss'
        },
        authorizationUsername: '101',
        authorizationPassword: 'severalleddepend8912@@'
      }

      ua.value = new UserAgent(configuration)
      ua.value.start()

      ua.value.delegate = {
        onInvite: (invitation: Invitation) => {
          incomingCall.value = handleInboundCall(invitation, audioElement.value!)
        },
        onConnect: () => {
          console.log(' >>>>>>>>>>>> Connected')
        }
      }
    }

    const makeOutboundCall = (target: string) => {
      if (ua.value && audioElement.value) {
        initiateOutboundCall(ua.value, `sip:${target}@sip.xtrevo.com`, audioElement.value)
      }
    }

    const answerCall = () => {
      incomingCall.value?.answer()
      incomingCall.value = null
    }

    const rejectCall = () => {
      incomingCall.value?.reject()
      incomingCall.value = null
    }

    const endCurrentCall = () => {
      callStore.endCall('answered')
    }

    return {
      connectToSIP,
      makeOutboundCall,
      answerCall,
      rejectCall,
      endCurrentCall,
      isInCall: callStore.isInCall,
      callStatus: callStore.callStatus,
      callLogs: callStore.callLogs,
      incomingCall,
      audioElement,
      ua
    }
  }
})
</script>
