// ExcalidrawComponent.vue
<template>
    <div ref="excalidrawWrapper" class="excalidraw-wrapper"></div>
</template>

<script>
    import { Excalidraw } from '@excalidraw/excalidraw';
    import * as React from 'react';
    import * as ReactDOM from 'react-dom';
    import { defineComponent, onMounted, ref, shallowRef } from 'vue';

    export default defineComponent({
        name: 'ExcalidrawComponent',
        props: {
            initialData: {
                type: Object,
                default: () => ({})
            }
        },

        setup(props, { emit }) {
            const excalidrawWrapper = ref(null)
            const excalidrawRef = shallowRef(null)

            onMounted(() => {
                // Create a React root and render Excalidraw
                const root = ReactDOM.createRoot(excalidrawWrapper.value)

                root.render(
                    React.createElement(Excalidraw, {
                        ref: (api) => {
                            excalidrawRef.value = api
                        },
                        initialData: props.initialData,
                        onChange: (elements, state) => {
                            emit('onChange', { elements, state })
                        },
                        onSave: (elements, state) => {
                            emit('onSave', { elements, state })
                        }
                    })
                )
            })

            return {
                excalidrawWrapper,
                excalidrawRef
            }
        }
    })
</script>

<style scoped>
    .excalidraw-wrapper {
        width: 100%;
        height: 500px;
    }

    /* Make sure Excalidraw fills the wrapper */
    :deep(.excalidraw) {
        height: 100%;
    }
</style>