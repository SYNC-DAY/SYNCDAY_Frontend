// Card.vue
<template>
  <div class="card">
    <div class="card-header">
      <div 
        class="tag" 
        :style="{ backgroundColor: card.tag_color }"
      >
        {{ card.tag_name }}
      </div>
      <div class="dates">
        {{ formatDate(card.start_time) }} - {{ formatDate(card.end_time) }}
      </div>
    </div>
    <h4 class="card-title">{{ card.card_title }}</h4>
    <p class="card-content">{{ card.card_content }}</p>
    <div class="card-footer">
      <div class="assignee">
        <img 
          :src="card.assignee_profile_url" 
          :alt="card.assignee_name"
          class="avatar"
        >
        <span>{{ card.assignee_name }}</span>
      </div>
      <div class="team">{{ card.assignee_team_name }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  card: {
    type: Object,
    required: true
  }
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  });
};
</script>

<style scoped>
.card {
  background: white;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.tag {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: white;
}

.dates {
  font-size: 0.75rem;
  color: #666;
}

.card-title {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.card-content {
  font-size: 0.875rem;
  color: #444;
  margin-bottom: 1rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assignee {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.team {
  font-size: 0.75rem;
  color: #666;
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
</style>