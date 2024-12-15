<!-- WorkspaceItem.vue -->
<template>
    <div class="workspace-item" @click="handleClick">
        <span>{{ workspace.workspace_name }}</span>
        <!-- 추가적인 workspace 정보 표시 가능 -->
    </div>
</template>

<script setup>
    const props = defineProps({
        workspace: {
            type: Object,
            required: true
        }
    });

    const emit = defineEmits(['select']);

    const handleClick = () => {
        emit('select', props.workspace);
    };
</script>