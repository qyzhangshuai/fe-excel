<template>
    <a-form
        ref="formRef"
        :model="formState"
        :label-col="{ style: { width: '100px' } }"
        name="basic"
        autocomplete="off"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
    >
        <a-form-item label="excel文件" name="excelFile" :rules="[{ required: true, validator: validatorExcelFile }]">
            <a-upload-dragger
                :file-list="formState.excelFile"
                :maxCount="1"
                accept=".xlsx,.xls"
                :before-upload="beforeUpload"
                @remove="handleRemove"
            >
                <p class="ant-upload-drag-icon">
                    <InboxOutlined></InboxOutlined>
                </p>

                请选择Excel文件
            </a-upload-dragger>
        </a-form-item>

        <a-form-item label="用户名" name="users">
            <a-textarea
                v-model:value="formState.users"
                placeholder="请输入用户名"
                :auto-size="{ minRows: 4, maxRows: 10 }"
            />
        </a-form-item>

        <a-form-item style="margin-left: 100px">
            <a-space>
                <a-button type="primary" html-type="submit" :loading="loading">{{
                    loading ? "解析中" : "解析"
                }}</a-button>
                <a-button @click="onReset">重置</a-button>
                <slot name="extra"></slot>
            </a-space>
        </a-form-item>
    </a-form>
</template>
<script setup>
import { reactive, ref } from "vue"
import { InboxOutlined } from "@ant-design/icons-vue"
import { isFillArr } from "@/utils"
import { uniq } from "lodash-es"

defineProps({
    loading: {
        type: Boolean,
        default: false,
    },
})

const emits = defineEmits(["submit", "reset"])

const initFormData = () => ({
    excelFile: [],
    users: "",
})
const formState = reactive(initFormData())
const formRef = ref()

const validatorExcelFile = (_rule, value) => {
    if (value.length === 0) {
        return Promise.reject("请选择Excel文件")
    }
    return Promise.resolve()
}

const beforeUpload = (file) => {
    // 直接进行替换，不进行追加
    formState.excelFile = [file]
    return false
}

const handleRemove = (file) => {
    const index = formState.excelFile.indexOf(file)
    const newFileList = formState.excelFile.slice()
    newFileList.splice(index, 1)
    formState.excelFile = newFileList
    formRef.value.validate("excelFile")
}

const onReset = () => {
    const initData = initFormData()
    Object.keys(initData).forEach((key) => {
        formState[key] = initData[key]
    })

    formRef.value.resetFields()

    emits("reset")
}

const onFinish = (values) => {
    const users = formState.users.split(/[\s,，]+/).filter(Boolean)
    emits("submit", {
        excelFile: formState.excelFile[0],
        // formState.users 会以空格、换行、逗号进行分割
        users: isFillArr(users) ? uniq(users) : [],
    })
}

const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo)
}

defineExpose({
    getUser: () => {
        const users = formState.users.split(/[\s,，]+/).filter(Boolean)
        return isFillArr(users) ? uniq(users) : []
    },
    setUser: (name) => {
        if (name) {
            formState.users = `${formState.users} ${name}`
        }
    },
})
</script>
