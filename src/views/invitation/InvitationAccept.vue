<template>
    <div>
        <div class="assistant-container">
            <div class="baloon">
                <h4>성공적으로 일정 참여 여부가 등록되었습니다.</h4>
                <p>일정초대 탭에서도 참여 여부를 수정하실 수 있습니다.</p>
            </div>
            <div class="assistant">
                <img src="@/assets/images/assistant.png" alt="Assistant" />
            </div>
        </div>

        <div class="button-container">
            <Button @click="toMainPage">메인페이지</Button>
            <Button @click="toInvitation">일정초대</Button>
        </div>

        
    </div>
</template>

<script setup>
import { onMounted , ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const router = useRouter();

const route = useRoute();
const isAccept = route.query.isAccept;
const fromWho = route.query.fromWho;
const scheduleId = route.query.scheduleId;
const status = route.query.status;

const authStore = useAuthStore();
const userId = authStore.user.userId;

const toMainPage = () => {
    router.push('/');
};

const toInvitation = () => {
    router.push('/invitation/view');
};

onMounted(async ()=>{
    if(fromWho == userId) {
        try{
            const response = await axios.put(`/userschedule/status`,{
                schedule_id: scheduleId,
                user_id: userId,
                participation_status: status
            });
        } catch{
            console.error("참석여부 등록 요청에 실패했습니다.");
        }
    }
});


</script>

<style scoped>
.assistant-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 50vh; /* 화면 전체 높이 */
    text-align: center;
    background-color: #f9f9f9; /* 배경색 추가 */
}

.baloon {
    position: relative;
    background-color: #ffffff;
    border: 2px solid #ddd;
    border-radius: 16px;
    padding: 16px 24px;
    max-width: 320px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 50px; /* 비서 이미지와 간격 조정 */
}

.baloon::after {
    content: '';
    position: absolute;
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 16px;
    border-style: solid;
    border-color: #ffffff transparent transparent transparent;
}

.assistant {
    width: 120px;
    height: 120px;
    overflow: hidden;
    margin-bottom: 20px; /* 버튼과 간격 조정 */
}

.assistant img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.button-container {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 20px;
}

</style>