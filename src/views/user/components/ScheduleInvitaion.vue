<template>
    <div class="logo-container">
        <img class="logo-img" src="@/assets/images/syncdaylogo.svg" alt="일정초대없을때 나오는 이미지">
        <h1 class="logo-text">초대된 일정이 없습니다.</h1>
    </div>
</template>

<script setup>

</script>

<style scoped>
    .logo-container {
        height: 50%;
        width: 50%;
        display: flex; /* Flexbox를 사용하여 중앙 정렬 */
        justify-content: center; /* 수평 중앙 정렬 */
        align-items: center; /* 수직 중앙 정렬 */
        overflow: hidden; /* 이미지가 컨테이너 밖으로 나가지 않도록 설정 */
        position: relative; /* 하위 요소의 위치 설정을 위한 기준 */
    }

    .logo-img {
        height: auto; /* 자동으로 높이 설정 */
        width: 80%; /* 가로 너비를 80%로 제한 */
        max-width: 100%; /* 가로 최대 크기를 부모에 맞춤 */
        max-height: 100%; /* 세로 최대 크기를 부모에 맞춤 */
        position: relative; /* 위치 설정 */
        opacity: 0.3; /* 기본 투명도 */
    }

    .logo-text {
        position: absolute; /* 부모를 기준으로 위치를 설정 */
        z-index: 1; /* 이미지보다 위에 오도록 설정 */
        color: black; /* 텍스트 색상 */
        font-size: 2rem; /* 텍스트 크기 */
        text-align: center; /* 텍스트를 중앙 정렬 */
    }
</style>
