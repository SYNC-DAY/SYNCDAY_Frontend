<template>
    <div class="calendar">
        <div class="calendar-header">
            <div class="calendar-nav">
                <span class="year-month">{{ currentYear }}년 {{ currentMonth + 1 }}월</span>
                <div class="nav-buttons">
                    <button @click="prevMonth">&lt;</button>
                    <button @click="goToToday">오늘</button>
                    <button @click="nextMonth">&gt;</button>
                </div>
            </div>
        </div>

        <div class="calendar-grid">
            <!-- 요일 헤더 -->
            <div class="weekday-header" v-for="day in weekDays" :key="day">
                {{ day }}
            </div>

            <!-- 날짜 그리드 업데이트 -->
            <div
                v-for="day in calendarDays"
                :key="day.date"
                class="calendar-day"
                :class="{
                    'current-month': day.isCurrentMonth,
                    'other-month': !day.isCurrentMonth,
                    selected: selectedDate && day.date.toDateString() === selectedDate.toDateString(),
                    dragover: isDraggingOver,
                }"
                @click="selectDate(day)"
                @dragover="onDragOver"
                @drop="onDrop($event, day.date)"
            >
                <span class="date">{{ day.date.getDate() }}</span>

                <!-- 이벤트 표시 -->
                <div class="events-container">
                    <div
                        v-for="event in day.events"
                        :key="event.id"
                        class="event"
                        :style="{ backgroundColor: event.color }"
                        draggable="true"
                        @dragstart="onDragStart($event, event)"
                        @dragend="onDragEnd"
                    >
                        {{ event.title }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
    userId: {
        type: String,
        required: true,
    },
});

// 상태 관리
const currentDate = ref(new Date());
const selectedDate = ref(null);
const events = ref([
    // 예시 이벤트 데이터
    {
        id: 1,
        title: '미팅',
        date: new Date(2024, 10, 7),
        color: '#7c5dfa',
    },
    {
        id: 2,
        title: '프로젝트 마감',
        date: new Date(2024, 10, 15),
        color: '#ff5733',
    },
]);

// 현재 보여지는 년도와 월
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

// 캘린더 데이터 계산
const calendarDays = computed(() => {
    const year = currentYear.value;
    const month = currentMonth.value;

    // 해당 월의 첫날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 이전 달의 마지막 날들
    const prevMonthLastDay = new Date(year, month, 0);
    const prevMonthDays = prevMonthLastDay.getDate();

    // 첫 주의 시작일 (일요일부터)
    const firstDayOfWeek = firstDay.getDay();

    const days = [];

    // 이전 달의 날짜들
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthDays - i);
        days.push({
            date,
            isCurrentMonth: false,
            events: events.value.filter((event) => event.date.toDateString() === date.toDateString()),
        });
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push({
            date,
            isCurrentMonth: true,
            events: events.value.filter((event) => event.date.toDateString() === date.toDateString()),
        });
    }

    // 다음 달의 날짜들
    const remainingDays = 42 - days.length; // 6주 표시를 위해
    for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
            date,
            isCurrentMonth: false,
            events: events.value.filter((event) => event.date.toDateString() === date.toDateString()),
        });
    }

    return days;
});

// 드래그 앤 드롭 관련 함수들
const draggedEvent = ref(null);

const onDragStart = (event, calendarEvent) => {
    draggedEvent.value = calendarEvent;
    event.dataTransfer.effectAllowed = 'move';
    // 드래그 시 반투명하게 표시
    event.target.style.opacity = '0.5';
};

const onDragEnd = (event) => {
    event.target.style.opacity = '1';
    draggedEvent.value = null;
};

const onDragOver = (event) => {
    // 드롭을 허용하기 위해 기본 동작 방지
    event.preventDefault();
};

const onDrop = (event, targetDate) => {
    event.preventDefault();

    if (!draggedEvent.value) return;

    // 이벤트 날짜 업데이트
    const eventToUpdate = events.value.find((e) => e.id === draggedEvent.value.id);
    if (eventToUpdate) {
        eventToUpdate.date = new Date(targetDate);
        // 여기에 API 호출 추가 가능
        updateEvent(eventToUpdate);
    }

    draggedEvent.value = null;
};

// 요일 라벨
const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

// 이전 달로 이동
const prevMonth = () => {
    currentDate.value = new Date(currentYear.value, currentMonth.value - 1);
    fetchEvents();
};

// 다음 달로 이동
const nextMonth = () => {
    currentDate.value = new Date(currentYear.value, currentMonth.value + 1);
    fetchEvents();
};

// 오늘로 이동
const goToToday = () => {
    currentDate.value = new Date();
    fetchEvents();
};

// 날짜 선택
const selectDate = (day) => {
    selectedDate.value = day.date;
};

// API 호출 함수 (실제 구현 필요)
const updateEvent = async (event) => {
    try {
        // const response = await fetch(`/api/events/${event.id}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(event)
        // });
        console.log('Event updated:', event);
    } catch (error) {
        console.error('Failed to update event:', error);
    }
};

// 컴포넌트 마운트 시 이벤트 데이터 가져오기
onMounted(() => {
    fetchEvents();
});
</script>

<style scoped>
.calendar {
    max-width: 800px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
}

.calendar-header {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.calendar-nav {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.year-month {
    font-size: 1.5rem;
    font-weight: bold;
}

.nav-buttons {
    display: flex;
    gap: 0.5rem;
}

.nav-buttons button {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background: #f0f0f0;
    border: 1px solid #ddd;
}

.weekday-header {
    padding: 0.5rem;
    text-align: center;
    background: #f8f8f8;
    font-weight: bold;
}

.calendar-day {
    min-height: 100px;
    padding: 0.5rem;
    background: white;
    cursor: pointer;
    position: relative;
}

.calendar-day:hover {
    background: #f8f8f8;
}

.other-month {
    color: #ccc;
}

.selected {
    background: #e6f3ff;
}

.has-event {
    font-weight: bold;
}

.event-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #7c5dfa;
    position: absolute;
    bottom: 4px;
    right: 4px;
}

.date {
    font-size: 0.9rem;
}

.events-container {
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.event {
    font-size: 0.8rem;
    padding: 2px 4px;
    border-radius: 2px;
    color: white;
    cursor: grab;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.event:active {
    cursor: grabbing;
}

.calendar-day.dragover {
    background-color: #e6f3ff;
}

/* 드래그 중인 이벤트 스타일 */
.event.dragging {
    opacity: 0.5;
}
</style>
