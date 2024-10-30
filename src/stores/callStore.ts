// src/stores/callStore.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

interface CallLog {
  startTime: Date
  endTime?: Date
  duration?: number // in seconds
  status: 'answered' | 'missed' | 'rejected'
}

export const useCallStore = defineStore('call', () => {
  const isInCall = ref(false)
  const callStatus = ref('')
  const callLogs = ref<CallLog[]>([])
  const totalCallDuration = ref(0) // Cumulative duration in seconds
  const currentCallStartTime = ref<Date | null>(null)

  const startCall = () => {
    isInCall.value = true
    currentCallStartTime.value = new Date()
    callStatus.value = 'ringing'
  }

  const endCall = (status: 'answered' | 'missed' | 'rejected') => {
    const endTime = new Date()
    const duration = currentCallStartTime.value ? (endTime.getTime() - currentCallStartTime.value.getTime()) / 1000 : 0

    // Add the new call log
    callLogs.value.push({
      startTime: currentCallStartTime.value as Date,
      endTime,
      duration,
      status
    })

    // Update the total duration
    totalCallDuration.value += duration

    // Reset call state
    isInCall.value = false
    callStatus.value = status
    currentCallStartTime.value = null
  }

  const callDuration = computed(() => {
    if (currentCallStartTime.value) {
      const now = new Date()
      return (now.getTime() - currentCallStartTime.value.getTime()) / 1000 // in seconds
    }
    return 0
  })

  return {
    isInCall,
    callStatus,
    callLogs,
    currentCallStartTime,
    totalCallDuration, // Cumulative total call duration
    startCall,
    endCall,
    callDuration
  }
})
