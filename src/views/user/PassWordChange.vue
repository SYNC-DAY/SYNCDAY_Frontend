<template>
    <div class="password-change-page">
        <h1 class="my-page-title">MyPage</h1>
      <div class="password-card">
        <!-- 좌우 분할을 위한 컨테이너 -->
        <div class="split-container">
          <!-- 왼쪽 디자인 섹션 -->
          <div class="design-section">
            <div class="gradient-box">
              <span class="logo-text">Sync Day</span>
            </div>
          </div>

          <!-- 오른쪽 폼 섹션 -->
          <div class="form-section">
            <div class="header-container">
                <h2 class="page-title">
                <img src="@/assets/images/lock.svg" alt="lock icon"/>
                    비밀번호 변경하기
                </h2>
            </div>
            <form @submit.prevent="handleSubmit" class="password-form">
              <div class="form-group">
                <label class="form-label">현재 비밀번호</label>
                <div class="password-input-container">
                  <input
                    v-model="editForm.currentPwd"
                    :type="!showCurrentPwd ? 'text' : 'password'"
                    class="form-input"
                    required
                  />
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
                  <input
                    v-model="editForm.newPwdA"
                    :type="!showNewPwdA ? 'text' : 'password'"
                    class="form-input"
                    required
                    @input="validatePasswords"
                  />
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
                  <input
                    v-model="editForm.newPwdB"
                    :type="!showNewPwdB ? 'text' : 'password'"
                    class="form-input"
                    required
                    @input="validatePasswords"
                  />
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
                <button
                  type="submit"
                  class="submit-button"
                  :disabled="!isPasswordValid"
                >
                  비밀번호 변경
                </button>
                <button
                  type="button"
                  @click="goToMyPage"
                  class="cancel-button"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'
  import { useAuthStore } from '@/stores/auth.js'
  import axios from 'axios'
  import Swal from 'sweetalert2'

  const router = useRouter()
  const passwordError = ref('')
  const isPasswordValid = ref(false)

  const showCurrentPwd = ref(true)
  const showNewPwdA = ref(true)
  const showNewPwdB = ref(true)

  const authStore = useAuthStore();
  const user = ref(authStore.user || {});
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
  @import url('https://fonts.googleapis.com/css2?family=Inspiration&display=swap');

  :root {
    --swal2-font-size: 2rem;
  }

  .large-popup {
    font-size: 2rem !important;
  }

  .large-title {
    font-size: 3rem !important;
    padding: 2rem !important;
  }

  .large-button {
    font-size: 2rem !important;
    padding: 1rem 3rem !important;
    border-radius: 2.5rem !important;
  }

  /* 아이콘 크기 조정 */
  .swal2-icon {
    width: 8rem !important;
    height: 8rem !important;
    margin: 2rem auto !important;
  }

  .swal2-icon-content {
    font-size: 4rem !important;
  }

  .my-page-title {
    margin: 1rem 0;
    font-size: 4rem;
    font-weight: bold;
    color: #333;
    width: 100%;          /* 추가 */
    max-width: 112rem;     /* password-card와 동일한 max-width */
}


  .password-change-page {
    max-width: 112rem;
    margin: 0 auto;
    padding: 0 2rem;
    min-height:200vh;
    display: flex;          /* 추가 */
    flex-direction: column; /* 추가 */
    align-items: center;
  }

  .password-card {
    background: white;
    border-radius: 5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    width: 100%;          /* 980px에서 100%로 변경 */
    max-width: 130rem;     /* 최대 너비 설정 */
    height: 90rem;
}

  .split-container {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .design-section {
    display: flex;
    align-items: center;
    padding: 1rem;
    width: 100%;
  }

  .gradient-box {
    width: 100%;
    height: 88rem;
    background: linear-gradient(rgba(254, 93, 134, 1), rgba(254, 119, 134, 1), rgba(255, 157, 133, 1), rgba(255, 157, 133, 1));
    border-radius: 5rem;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.logo-text {
    font-family: 'Inspiration', cursive;
    font-size: 15rem;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    position: absolute;
    left: 50%;
    top: 35%;
    transform: translate(-50%, -50%) rotate(-14deg);
}

.header-container {
  margin-bottom: 7rem;
}

  .form-section {
    flex: 1;
    width: auto;
    min-width: 70rem;
    padding: 0 5rem;
    padding-bottom: 5rem;
  }

  .page-title {
    font-size: 3.5rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 2rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .password-form {
    display: flex;
    flex-direction: column;
  }

.form-group {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    padding: 0 5rem;
}

.form-label {
    font-size: 1.8rem;
    font-weight: normal;
    color: #666;
    width: 150px;
    margin-bottom: 1rem;
}

  .password-input-container {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.form-input {
    width: 100%;
    padding: 1.4rem 1.5rem;
    border: 0.3rem solid #ddd;
    border-radius: 0.5rem;
    font-size: 2.5rem;
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

  .icon {
    width: 2.2rem;
    height: 2.3rem;
  }

  .password-toggle:hover {
    color: #333;
  }

  .error-message {
    color: #dc3545;
    font-size: 1.5rem;
    font-weight: 740;
    position: absolute;
    bottom: -0.1rem;
  }

  .button-group {
    display: flex;
    justify-content: space-evenly;
    margin-top: 2rem;
    padding: 0 1rem;
  }

  .cancel-button {
    width: 30%;
    padding: 1rem 2rem;
    background-color: #aaa8a8;
    border: solid #aaa8a8 0.5rem;
    color: white;
    border-radius: 2.5rem;
    font-size: 2rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-button:hover {
    background-color: black;
    border: solid black 0.5rem;
    color: white;
  }

  .submit-button {
    width: 30%;
    padding: 1rem 2rem;
    background-color: #ffffff;
    color: rgb(0, 0, 0);
    border: solid black 0.5rem;
    border-radius: 2.5rem;
    font-size: 2rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .submit-button:hover {
    background-color: #333;
    color: white;
  }

</style>