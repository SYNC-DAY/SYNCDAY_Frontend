/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ['plugin:vue/vue3-essential', 'eslint:recommended', '@vue/eslint-config-prettier'],
    parserOptions: {
        ecmaVersion: 'latest'
    },
    rules: {
        'vue/multi-word-component-names': 'off',
        'vue/no-reserved-component-names': 'off',
        'vue/component-tags-order': [
            'error',
            {
                order: ['script', 'template', 'style']
            }
        ],
        '@typescript-eslint/no-unused-vars': 'off', // TypeScript를 사용하는 경우
        'no-unused-imports': 'off',
        'unused-imports/no-unused-imports': 'off',
        'unused-imports/no-unused-vars': 'off'
    }
};
