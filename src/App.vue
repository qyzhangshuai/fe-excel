<template>
    <a-config-provider :locale="zhCN">
        <router-view></router-view>
        <a-back-top />
    </a-config-provider>
</template>

<script setup>
import zhCN from "ant-design-vue/es/locale/zh_CN"
</script>
