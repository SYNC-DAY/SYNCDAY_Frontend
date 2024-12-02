<template>
  <div class="app-container">
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
// GitHub App integration 기능만 포함
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

main {
  flex: 1;
  display: flex;
}
</style>