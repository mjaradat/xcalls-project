<!-- src/components/DialPad.vue -->
<template>
  <div class="dial-pad">
    <!-- Display the phone number -->
    {{ phoneNumber }}
    <input v-model="phoneNumber" type="text" />

    <!-- Number buttons -->
    <div class="digits">
      <button v-for="digit in digits" :key="digit" @click="addDigit(digit)">
        {{ digit }}
      </button>
    </div>

    <!-- Call and Clear buttons -->
    <div class="actions">
      <button class="call-button" @click="makeCall">Call</button>
      <button class="clear-button" @click="clearPhoneNumber">Clear</button>
    </div>
  </div>
</template>
<!-- 0502450637 -->
<script lang="ts" setup>
import { PropType, ref, toRefs } from "vue";
const props = defineProps({
  onCall: {
    type: Function as PropType<(target: string) => void>,
    required: true,
  },
});
const { onCall } = toRefs(props);
const phoneNumber = ref(""),
  digits = ref(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]);

// Add a digit to the phone number
const addDigit = (digit: string) => {
  phoneNumber.value += digit;
};
// Trigger the onCall function with the phone number
const makeCall = () => {
  if (phoneNumber.value) {
    onCall.value(phoneNumber.value);
    phoneNumber.value = ""; // Clear after making the call
  }
};
// Clear the phone number
const clearPhoneNumber = () => {
  phoneNumber.value = "";
};
</script>

<style scoped>
.dial-pad {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.phone-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.digits {
  display: grid;
  grid-template-columns: repeat(3, 50px);
  gap: 10px;
}

.actions {
  margin-top: 10px;
}

button {
  padding: 10px;
  font-size: 18px;
}

.call-button {
  font-weight: bold;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

.clear-button {
  font-weight: bold;
  background-color: #f44336;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
