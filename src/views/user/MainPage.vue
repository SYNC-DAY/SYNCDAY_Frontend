<template>
    <div class="grid">
        <!-- Calendar Widget -->
        <div class="col-12 md:col-6 lg:col-6 xl:col-3">
            <div class="card">
                <h5>Calendar</h5>
                <Calendar inline />
            </div>
        </div>

        <!-- Chat Widget -->
        <div class="col-12 md:col-6 lg:col-6 xl:col-3">
            <div class="card">
                <h5>Messages</h5>
                <ScrollPanel style="height: 400px">
                    <div v-for="(message, index) in messages" :key="index" class="flex align-items-start mb-3">
                        <Avatar :image="message.avatar" shape="circle" class="mr-2" />
                        <div>
                            <span class="font-bold block">{{ message.sender }}</span>
                            <span class="text-500">{{ message.content }}</span>
                        </div>
                    </div>
                </ScrollPanel>
            </div>
        </div>

        <!-- Posts Widget -->
        <div class="col-12 md:col-6 lg:col-6 xl:col-3">
            <div class="card">
                <h5>Recent Posts</h5>
                <DataView :value="posts" :paginator="true" :rows="5">
                    <template #list="slotProps">
                        <div class="col-12" v-if="slotProps.data">
                            <div class="flex flex-column xl:flex-row xl:align-items-start p-2 gap-4">
                                <div class="flex flex-column w-full">
                                    <span class="font-bold">{{ slotProps.data.title }}</span>
                                    <span class="text-500">{{ slotProps.data.date }}</span>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template #empty>
                        <div class="text-center">데이터가 없습니다.</div>
                    </template>
                </DataView>
            </div>
        </div>

        <!-- Task Cards Widget -->
        <div class="col-12 md:col-6 lg:col-6 xl:col-3">
            <div class="card">
                <h5>Task Cards</h5>
                <div v-for="(task, index) in tasks" :key="index" class="mb-3">
                    <Card>
                        <template #title>
                            {{ task.title }}
                        </template>
                        <template #content>
                            <Tag :severity="task.status">{{ task.status }}</Tag>
                            <ProgressBar :value="task.progress" class="mt-2" />
                        </template>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { onMounted, ref } from 'vue';

    // Sample data with reactive initialization
    const messages = ref([]);
    const posts = ref([]);
    const tasks = ref([]);

    // Initialize data
    onMounted(() => {
        // Messages initialization
        messages.value = [
            {
                sender: '홍길동',
                content: '안녕하세요! 미팅 시간 확인해주세요.',
                avatar: 'path/to/avatar1.jpg'
            },
            {
                sender: '김철수',
                content: '프로젝트 진행상황 공유드립니다.',
                avatar: 'path/to/avatar2.jpg'
            }
        ];

        // Posts initialization
        posts.value = [
            {
                title: '2024년 상반기 계획',
                date: '2024-03-11'
            },
            {
                title: '주간 회의록',
                date: '2024-03-10'
            },
            {
                title: '신규 프로젝트 공지',
                date: '2024-03-09'
            }
        ];

        // Tasks initialization
        tasks.value = [
            {
                title: '기획안 작성',
                status: 'success',
                progress: 100
            },
            {
                title: '디자인 검토',
                status: 'warning',
                progress: 65
            },
            {
                title: '개발 시작',
                status: 'info',
                progress: 30
            }
        ];
    });
</script>

<style scoped>
    .card {
        background: var(--surface-card);
        padding: 1.5rem;
        margin-bottom: 1rem;
        border-radius: 10px;
        box-shadow:
            0 2px 1px -1px rgba(0, 0, 0, 0.2),
            0 1px 1px 0 rgba(0, 0, 0, 0.14),
            0 1px 3px 0 rgba(0, 0, 0, 0.12);
    }
</style>
