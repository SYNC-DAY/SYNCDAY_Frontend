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
  import axios from 'axios'
  
  const router = useRouter()
  const passwordError = ref('')
  const isPasswordValid = ref(false)
  
  const showCurrentPwd = ref(true)
  const showNewPwdA = ref(true)
  const showNewPwdB = ref(true)
  
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
      
      await axios.put(`/user/password`, requestData)
      alert('비밀번호가 성공적으로 변경되었습니다.')
      router.push('/mypage')
    } catch (error) {
      if (error.response?.data?.error?.message) {
        alert(error.response.data.error.message)
      } else {
        alert('비밀번호 변경에 실패했습니다. 다시 시도해주세요.')
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

  .my-page-title {
    font-size: 2rem;
    font-weight: bold;
    color: #333;
    width: 100%;          /* 추가 */
    max-width: 900px;     /* password-card와 동일한 max-width */
    padding: 0 8px;       /* 추가: 좌우 여백 */
}

  
  .password-change-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
    display: flex;          /* 추가 */
    flex-direction: column; /* 추가 */
    align-items: center; 
  }
  
  .password-card {
    background: white;
    border-radius: 30px;
    border: solid #D9D9D9 1px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    width: 100%;          /* 980px에서 100%로 변경 */
    max-width: 900px;     /* 최대 너비 설정 */
    max-height: 900px;
    margin: 0 auto;  
}
  
  .split-container {
    display: flex;
    align-items: center;
    width: 100%;
  }
  
  .design-section {
    display: flex;
    align-items: center;
    padding: 8px;
    width: 100%;
  }
  
  .gradient-box {
    width: 100%;         /* 353px에서 100%로 변경 */
    max-width: 353px;    /* 최대 너비 설정 */
    height: 652px;
    background: linear-gradient(rgba(254, 93, 134, 1), rgba(254, 119, 134, 1), rgba(255, 157, 133, 1), rgba(255, 157, 133, 1));
    border-radius: 30px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.logo-text {
    font-family: 'Inspiration', cursive;
    font-size: 8rem;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    position: absolute; /* 추가 */
    left: 52%;         /* 추가 */
    top: 35%;          /* 추가 */
    transform: translate(-50%, -50%) rotate(-14deg); /* 수정 */
}
  
  .form-section {
    flex: 1;
    width: auto;     
    min-width: 400px;
    padding-right: 2.5rem;
  }
  
  .page-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 2rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .password-form {
    display: flex;
    flex-direction: column;
  }
  
  /* form-group도 중앙 정렬을 위해 수정 */
.form-group {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;   
}
  
.form-label {
    font-size: 1rem;
    font-weight: 500;
    color: #666;
    width: 150px; /* input container와 동일한 너비 */
}
  
  .password-input-container {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}
  
.form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    font-size: 1rem;
    padding-right: 2.5rem;
    margin-bottom: 20px;
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
    padding-bottom: 20px;
    height: 100%;  /* 추가: 부모 높이만큼 설정 */
    top: 0;  
  }
  
  .icon {
    width: 1.2rem;
    height: 1.3rem;
  }
  
  .password-toggle:hover {
    color: #333;
  }
  
  .error-message {
    color: #dc3545;
    font-size: 0.85rem;
    font-weight: 740;
    position: absolute;
    bottom: -0.1rem;
    left: 0;
    min-height: 1.2rem;
  }
  
  .button-group {
    display: flex;
    justify-content: space-evenly;
    margin-top: 1rem;
  }
  
  .cancel-button {
    width: 175px;
    padding: 0.5rem;
    background-color: #aaa8a8;
    border: solid #aaa8a8 3.5px;
    color: white;
    border-radius: 1rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .cancel-button:hover {
    background-color: black;
    border: solid black 3.5px;
    color: white;
  }
  
  .submit-button {
    width: 175px;
    padding: 0.5rem;
    background-color: #ffffff;
    color: rgb(0, 0, 0);
    border: solid black 3.5px;
    border-radius: 1rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .submit-button:hover {
    background-color: #333;
    color: white;
  }

</style>