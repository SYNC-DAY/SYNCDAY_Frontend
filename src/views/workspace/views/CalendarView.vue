<template>
	<div class="calendar-container">
		<div class="calendar-header">
			<div class="calendar-actions">
				<Button @click="calendar.prev()" icon="pi pi-chevron-left" />
				<Button @click="calendar.today()" label="Today" />
				<Button @click="calendar.next()" icon="pi pi-chevron-right" />
			</div>
			<h2>{{ calendarTitle }}</h2>
			<div class="view-selector">
				<Button @click="setView('dayGridMonth')"
					:class="{ active: currentView === 'dayGridMonth' }">Month</Button>
				<Button @click="setView('timeGridWeek')"
					:class="{ active: currentView === 'timeGridWeek' }">Week</Button>
				<Button @click="setView('timeGridDay')" :class="{ active: currentView === 'timeGridDay' }">Day</Button>
			</div>
		</div>

		<FullCalendar ref="fullCalendar" class="calendar-view" :options="calendarOptions" />

		<!-- Card Details Dialog -->
		<Dialog v-model:visible="cardDetailsVisible" :header="selectedCard?.card_title" modal
			:style="{ width: '450px' }">
			<div v-if="selectedCard" class="card-details">
				<div class="detail-row">
					<span class="detail-label">Status:</span>
					<Tag :value="selectedCard.tag_name"
						:style="{ backgroundColor: selectedCard.tag_color, color: '#fff' }" />
				</div>
				<div class="detail-row">
					<span class="detail-label">Duration:</span>
					<span>{{ formatDateRange(selectedCard.start_time, selectedCard.end_time) }}</span>
				</div>
				<div class="detail-row">
					<span class="detail-label">Assignee:</span>
					<div class="assignee-info">
						<img :src="selectedCard.assignee_profile_url" :alt="selectedCard.assignee_name"
							class="assignee-avatar" />
						<span>{{ selectedCard.assignee_name }}</span>
					</div>
				</div>
				<div class="detail-row">
					<span class="detail-label">Description:</span>
					<p>{{ selectedCard.card_content }}</p>
				</div>
			</div>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/vue3';

const props = defineProps({
	cardboards: {
		type: Array,
		required: true
	}
});

const fullCalendar = ref(null);
const calendar = ref(null);
const currentView = ref('dayGridMonth');
const cardDetailsVisible = ref(false);
const selectedCard = ref(null);

// Convert cards to calendar events
const calendarEvents = computed(() => {
	const events = [];

	props.cardboards.forEach(board => {
		board.cards.forEach(card => {
			events.push({
				id: card.card_id.toString(),
				title: card.card_title,
				start: card.start_time,
				end: card.end_time,
				backgroundColor: card.tag_color,
				extendedProps: { ...card }
			});
		});
	});

	return events;
});

// Calendar title
const calendarTitle = computed(() => {
	if (!calendar.value) return '';
	return calendar.value.view.title;
});

// Calendar configuration
const calendarOptions = {
	plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
	initialView: 'dayGridMonth',
	headerToolbar: false, // We're using custom header
	events: calendarEvents.value,
	editable: true,
	selectable: true,
	eventClick: handleEventClick,
	eventDrop: handleEventDrop,
	eventResize: handleEventResize,
	height: 'auto'
};

// Event handlers
function handleEventClick(info) {
	selectedCard.value = info.event.extendedProps;
	cardDetailsVisible.value = true;
}

async function handleEventDrop(info) {
	try {
		// Implement API call to update card dates
		console.log('Event dropped:', {
			cardId: info.event.id,
			newStart: info.event.start,
			newEnd: info.event.end
		});
	} catch (error) {
		info.revert();
		// Show error toast
	}
}

async function handleEventResize(info) {
	try {
		// Implement API call to update card dates
		console.log('Event resized:', {
			cardId: info.event.id,
			newStart: info.event.start,
			newEnd: info.event.end
		});
	} catch (error) {
		info.revert();
		// Show error toast
	}
}

// View controls
function setView(viewName) {
	currentView.value = viewName;
	calendar.value.changeView(viewName);
}

// Utility functions
function formatDateRange(start, end) {
	const startDate = new Date(start);
	const endDate = new Date(end);
	return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
}

onMounted(() => {
	const calendarEl = fullCalendar.value.getApi();
	calendar.value = calendarEl;
});
</script>

<style scoped>
.calendar-container {
	padding: 20px;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.calendar-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
}

.calendar-actions {
	display: flex;
	gap: 8px;
}

.view-selector {
	display: flex;
	gap: 8px;
}

.view-selector .p-button.active {
	background-color: var(--pink-color);
	border-color: var(--pink-color);
}

.calendar-view {
	flex: 1;
	background: white;
	border-radius: 8px;
	padding: 16px;
}

/* Card Details Dialog Styles */
.card-details {
	padding: 16px;
}

.detail-row {
	margin-bottom: 16px;
}

.detail-label {
	font-weight: bold;
	display: block;
	margin-bottom: 4px;
}

.assignee-info {
	display: flex;
	align-items: center;
	gap: 8px;
}

.assignee-avatar {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	object-fit: cover;
}

/* FullCalendar Customizations */
:deep(.fc) {
	font-family: inherit;
}

:deep(.fc-event) {
	cursor: pointer;
	border: none;
}

:deep(.fc-event-title) {
	padding: 2px 4px;
	font-weight: normal;
}

:deep(.fc-toolbar-title) {
	font-size: 1.2em;
}

:deep(.fc-button) {
	background-color: var(--pink-color);
	border-color: var(--pink-color);
}

:deep(.fc-button:hover) {
	background-color: var(--peach-color);
	border-color: var(--peach-color);
}

:deep(.fc-daygrid-day.fc-day-today) {
	background-color: #fff3f5;
}
</style>