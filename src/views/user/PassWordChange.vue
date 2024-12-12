<template>
  <div class="login-container">
    <div class="login-content">
      <!-- 왼쪽: 환영 메시지와 로고 -->
      <div class="login-welcome">
        <h1>당신의<br>일정을 편리하게<br>관리하세요</h1>
        <img src="@/assets/images/syncdaylogo.svg" alt="SyncDay Logo" class="logo">
      </div>
      <!-- 오른쪽: 로그인 폼 -->
      <div class="login-form-container">
        <!-- <h2>로그인</h2> -->
        <h2 class="page-title">
          <img src="@/assets/images/lock.svg" alt="lock icon"/>
          비밀번호 변경하기
        </h2>
        <form @submit.prevent="handleSubmit" class="password-form">
          <div class="form-group">
            <label class="form-label">현재 비밀번호</label>
            <div class="password-input-container">
            <!-- <InputText
                type="email"
                v-model="email"
                required
            /> -->
              <InputText v-model="editForm.currentPwd" :type="showCurrentPwd ? 'text' : 'password'" required class="form-input"/>
              <button
                    type="button"
                    class="password-toggle"
                    @click="togglePasswordVisibility('current')"
                  >
                    <EyeOffIcon v-if="!showCurrentPwd" class="icon" />
                    <EyeIcon v-else class="icon" />
                  </button>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">새 비밀번호</label>
            <div class="password-input-container">
              <InputText v-model="editForm.newPwdA" :type="showNewPwdA ? 'text' : 'password'" class="form-input" required @input="validatePasswords"/>
              <button
                    type="button"
                    class="password-toggle"
                    @click="togglePasswordVisibility('newA')"
                  >
                    <EyeOffIcon v-if="!showNewPwdA" class="icon" />
                    <EyeIcon v-else class="icon" />
                  </button>
            </div>
          </div>

            <div class="form-group">
              <label class="form-label">새 비밀번호 확인</label>
              <div class="password-input-container">
                <InputText v-model="editForm.newPwdB" :type="showNewPwdB ? 'text' : 'password'" class="form-input" required @input="validatePasswords"/>
                <button
                    type="button"
                    class="password-toggle"
                    @click="togglePasswordVisibility('newB')"
                  >
                    <EyeOffIcon v-if="!showNewPwdB" class="icon" />
                    <EyeIcon v-else class="icon" />
                  </button>
              </div>
              <span v-if="passwordError" class="error-message">
                {{ passwordError }}
              </span>
              </div>
              <div class="button-group">
                <Button
                  type="submit"
                  class="submit-button"
                  :disabled="!isPasswordValid"
                >
                  비밀번호 변경
                </Button>
                <Button
                  type="button"
                  @click="goToMyPage"
                  class="cancel-button"
                >
                  취소
                </Button>
              </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'
import {storeToRefs} from "pinia";
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import InputText from 'primevue/inputtext';
import axios from 'axios'
import Swal from 'sweetalert2'

const router = useRouter()
  const passwordError = ref('')
  const isPasswordValid = ref(false)

  const showCurrentPwd = ref(true)
  const showNewPwdA = ref(true)
  const showNewPwdB = ref(true)

  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)
  console.log("user.value: " ,user.value)

  const editForm = ref({
    currentPwd: '',
    newPwdA: '',
    newPwdB: '',
  })

  const validatePasswords = () => {
    const { newPwdA, newPwdB } = editForm.value

    if (newPwdA && newPwdB) {
      if (newPwdA !== newPwdB) {
        passwordError.value = '새 비밀번호가 일치하지 않습니다.'
        isPasswordValid.value = false
        return
      }
      passwordError.value = ''
      isPasswordValid.value = true
    } else {
      passwordError.value = ''
      isPasswordValid.value = false
    }
  }

  const handleSubmit = async () => {
    if (!isPasswordValid.value) return

    try {
      const requestData = {
        currentPwd: editForm.value.currentPwd,
        newPwd: editForm.value.newPwdA
      }

      const response = await axios.put(`/user/password/${user.value.userId}`, requestData)
      console.log("response", response)

      // 성공 알림
      await Swal.fire({
        width: '800px',
        height: '600px',
        icon: 'success',
        title: '성공!',
        text: '비밀번호가 성공적으로 변경되었습니다.',
        confirmButtonText: '확인',
        confirmButtonColor: '#3085d6',
        timer: 1500,  // 1.5초 후 자동으로 닫힘
      })

      router.push('/mypage')
    } catch (error) {
      console.error('Password change error:', error.response);

      if (error.response?.data?.error?.message) {
        // 검증 에러 메시지 표시
        const errorMessages = error.response.data.error.message;
        await Swal.fire({
          width: '60rem',
          padding: '3rem',
          icon: 'error',
          title: '오류',
          html: `<div style="font-size: 2rem; margin: 2rem 0;">${errorMessages}</div>`,
          confirmButtonText: '확인',
          confirmButtonColor: '#d33',
          customClass: {
            popup: 'large-popup',
            title: 'large-title',
            confirmButton: 'large-button'
          }
        })
      } else {
        await Swal.fire({
          width: '60rem',          // 더 큰 너비
          padding: '3rem',         // 내부 여백 추가
          icon: 'success',
          title: '성공!',
          html: '<div style="font-size: 2rem; margin: 2rem 0;">비밀번호가 성공적으로 변경되었습니다.</div>', // 폰트 크기 증가
          confirmButtonText: '확인',
          confirmButtonColor: '#3085d6',
          timer: 1500,
          customClass: {
            popup: 'large-popup',
            title: 'large-title',
            confirmButton: 'large-button'
          }
        })

      }
    }
  }

  const goToMyPage = () => {
    router.push('/mypage')
  }

  const togglePasswordVisibility = (field) => {
    switch(field) {
      case 'current':
        showCurrentPwd.value = !showCurrentPwd.value
        break
      case 'newA':
        showNewPwdA.value = !showNewPwdA.value
        break
      case 'newB':
        showNewPwdB.value = !showNewPwdB.value
        break
    }
  }
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  min-width: 70vw;
  margin-right: auto;
  margin-left: auto;
  background-color: #f5f5f5;
}

.login-content {
  display: flex;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  height: auto;
}

.login-welcome {
  flex: 1;
  /* padding: 5rem 5rem 5rem 5rem; */
  padding: 5rem;
  background-color: white;
}

.login-welcome h1 {
  font-size: 2.3rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
  line-height: 1.4;
}

.logo {
  max-width: 300px;
}

.login-form-container {
  flex: 1;
  padding: 5rem;
  border-left: 1px solid #eee;
  text-align: center;
}

.login-form-container h2 {
  font-size: 2.3rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 3rem;
}

.form-group {
  text-align: left; 
  width: 80%; 
  margin: 0 auto 1rem auto;
}

.form-group label {
  display: block; 
  margin-bottom: 0.5rem;
  font-size: large;
  color: #333;
  font-weight: 500;
  text-align: left;
}

.form-group input {
  width: 100%;
  padding: 0.5rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.login-button {
  width: 80%;
  padding: 1rem;
  color: white;
  border: none;
  border-radius: 1rem;
  font-size: 1.5rem;
  font-weight: 500;
  cursor: pointer;
}

  .password-input-container {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.password-toggle {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    top: -8%;
  }

  .password-toggle:hover {
    color: #333;
  }


.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}
</style>