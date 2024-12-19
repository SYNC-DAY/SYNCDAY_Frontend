<template>
    <ExcalidrawComponent :initialData="drawingData" :isCollaborative="false" @onChange="handleChange"
        @onSave="handleSave" />
</template>

<script>
    import ExcalidrawComponent from '@/components/ExcalidrawComponent.vue';

    export default {
        components: {
            ExcalidrawComponent
        },
        data() {
            return {
                drawingData: {}
            }
        },
        methods: {
            handleChange({ elements, state }) {
                console.log('Drawing changed:', elements)
            },
            handleSave(blob) {
                // Handle the saved PNG blob
                const url = URL.createObjectURL(blob)
                // Use the URL as needed
            }
        }
    }
</script>