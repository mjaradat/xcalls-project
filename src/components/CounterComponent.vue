<!-- src/components/Counter.vue -->
<template>
  <div>
    <h1>Counter: {{ count }}</h1>
    <button @click="increment">Increment</button>
    <button @click="decrement">Decrement</button>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { useCounterStore } from "../stores/counterStore";

const x = useCounterStore();
const { decrement, increment, count } = toRefs(x);
</script>

<style scoped>
button {
  margin: 0 5px;
}
</style>
