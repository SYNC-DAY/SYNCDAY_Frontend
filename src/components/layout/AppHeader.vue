<template>
    <header class="app-header">
      <Navigation :userName="userName" :profileImageUrl="profileImageUrl" />
      <!-- <Nav :userName="userName" :profileImageUrl="profileImageUrl" /> -->
    </header>
  </template>
  
  <script setup>
  import Navigation from './Navigation.vue';
  // import Nav from './Nav.vue';
  import { defineProps } from 'vue';
  
  const props = defineProps({
    userName: {
      type: String,
      required: true
    },
    profileImageUrl: {
      type: String,
      required: true
    }
  });
  </script>
  
  <style scoped>

  </style>
  