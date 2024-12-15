<!-- ProjItem.vue -->
<template>
    <div class="px-2 py-1 underline-gray">
        <div class="proj-header" @click="toggleExpand">
            <span>{{ project.proj_name }}</span>
            <!-- 확장/축소 아이콘 등 추가 가능 -->
        </div>
        <div v-if="isExpanded" class="workspaces">
            <slot></slot> <!-- WorkspaceItem들이 여기에 렌더링됨 -->
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue';

    const props = defineProps({
        project: {
            type: Object,
            required: true
        }
    });

    const isExpanded = ref(false);
    const toggleExpand = () => {
        isExpanded.value = !isExpanded.value;
    };
</script>