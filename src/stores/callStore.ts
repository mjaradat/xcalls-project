// src/stores/callStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { SessionState } from "sip.js";

export const useCallStore = defineStore("callStore", () => {
  const callSession = ref<any>(null); // Inviter or Invitation session
  const callState = ref<SessionState | null>(null);
  const isInCall = ref(false);
  const count = ref(0);

  const setCallSession = (session: any) => {
    callSession.value = session;
    isInCall.value = true;
  };

  const updateCallState = (newState: SessionState) => {
    callState.value = newState;
  };

  const resetCall = () => {
    callSession.value = null;
    callState.value = null;
    isInCall.value = false;
  };

  const increment = () => {
    count.value++;
  };
  const decrement = () => {
    count.value--;
  };

  return {
    count,
    callSession,
    callState,
    isInCall,
    setCallSession,
    updateCallState,
    resetCall,
    increment,
    decrement,
  };
});
