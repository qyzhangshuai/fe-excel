<template>
    <LayoutWrap>
        <SearchForm ref="SearchFormRef" :loading="state.loading" @submit="submit" @reset="reset">
            <template #extra v-if="isFillArr(state.tableList)">
                <a-button @click="exportExcel">导出</a-button>
            </template>
        </SearchForm>

        <template v-if="isFillArr(state.tableList)">
            <div v-if="searchUserLength" class="result-user">
                用户{{ searchUserLength }}人，成功解析{{ state.successUserLength || 0 }}人
            </div>
            <a-table
                style="width: 100%"
                sticky
                :scroll="{ x: 1500 }"
                :columns="state.columns"
                :data-source="dataSource"
                :pagination="pagination"
                :loading="state.loading"
                @change="handleTableChange"
            >
            </a-table>
        </template>
    </LayoutWrap>
</template>
<script setup lang="jsx">
import { reactive, computed, ref } from "vue"
import * as XlsxJsStyle from "xlsx-js-style"
import SearchForm from "./comps/search-form.vue"
import { message } from "ant-design-vue"
import { PlusCircleOutlined } from "@ant-design/icons-vue"
import usePage from "@/hooks/use-page.js"
import { isFillArr } from "@/utils"

const IphoneTitleArr = ["工作电话", "联系人电话"]
const NameText = "姓名"
const DefaultWidth = 10
const ExcelFileName = "东院康复科+第三方.xlsx"
const TitleWidth = {
    住院号: 9.29,
    姓名: 33.14,
    性别描述: 10.57,
    年龄: 5.29,
    现住址名称: 47.86,
    工作电话: 18.57,
    联系人姓名: 13.29,
    联系人电话: 13.29,
    入院时间: 12,
    出院日期: 12,
    出院科别: 12,
    出院科别描述: 15.86,
    住院天数: 10.57,
    主要诊断名称: 33.29,
    出院情况: 10.57,
    出院情况描述: 10.86,
    医疗小组: 10.57,
    主任医师姓名: 15.86,
    主治医师姓名: 15.86,
}
const initState = () => ({
    formState: {},
    tableList: [],
    columns: [],
    columnsTitle: [],
    loading: false,
    successUserLength: 0,
})
const SearchFormRef = ref()

const state = reactive(initState())
const hasUsers = computed(() => isFillArr(state.formState.users))
const searchUserLength = computed(() => state.formState.users?.length)
const { data: dataSource, run, current, pageSize, resetPage } = usePage(state)

const pagination = computed(() => ({
    total: state.tableList.length,
    current: current.value,
    pageSize: pageSize.value,
    showTotal: (total) => `共 ${total} 条`,
    position: ["bottomCenter"],
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "50", "100", "150", "200"],
}))

const handleTableChange = (pag) => {
    run({
        pageSize: pag.pageSize,
        current: pag?.current,
    })
}

const submit = (formState) => {
    state.formState = formState
    const { excelFile } = formState
    state.loading = true

    if (excelFile) {
        const fileReader = new FileReader()
        fileReader.onload = (e) => {
            const data = e.target.result
            const workbook = XlsxJsStyle.read(data, { type: "binary" })
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XlsxJsStyle.utils.sheet_to_json(worksheet, { header: 1 })
            state.loading = false
            if (isFillArr(jsonData)) {
                const columns = jsonData[0]
                genColumns(columns)
                genTableList(jsonData.slice(1))
            } else {
                message.warning("文件内容为空，请重新上传")
            }

            run({ current: 1 })
        }
        fileReader.readAsBinaryString(excelFile)
    }
}
const reset = () => {
    const localState = initState()
    for (const key in localState) {
        state[key] = localState[key]
    }
}

const exportExcel = () => {
    // 将表格内容导出，并将 record.isFlag为true的一行进行标红
    const { columnsTitle, tableList } = state
    // const data = [columnsTitle, ...tableList.map((item) => columnsTitle.map((subItem) => item[subItem]))]

    let data = []
    const titleData = columnsTitle.map((item) => ({
        v: item,
        t: "s",
        s: {
            font: { name: "宋体", sz: 9 },
            alignment: { vertical: "center", horizontal: "center" },
            border: {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            },
        },
    }))
    data.push(titleData)

    const tableListData = tableList.map((item) => {
        let font = {
            name: "Arial",
            sz: 9,
        }
        if (item.isFlag) {
            font.color = { rgb: "FF0000" }
        }

        return columnsTitle.map((subItem) => ({
            v: item[subItem] || "",
            t: "s",
            s: {
                font,
                border: {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                },
                // alignment: { horizontal: "center" },
                alignment: { vertical: "center" },
            },
        }))
    })
    data.push(...tableListData)

    const ws = XlsxJsStyle.utils.aoa_to_sheet(data)
    const wb = XlsxJsStyle.utils.book_new()
    ws["!cols"] = columnsTitle.map((item) => ({ width: TitleWidth[item] || DefaultWidth }))
    //  设置行高
    ws["!rows"] = [{ hpx: 15.75 }, ...tableListData.map(() => ({ hpx: 15.75 }))]
    XlsxJsStyle.utils.book_append_sheet(wb, ws, "工作表1")
    XlsxJsStyle.writeFile(wb, ExcelFileName)
}

const iphoneRegx = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/
const genColumns = (columns) => {
    state.columnsTitle = columns

    state.columns = columns.map((item, index) => {
        let obj = {}
        if (index === 0) {
            obj = {
                fixed: "left",
            }
        } else if (index === columns.length - 1) {
            obj = {
                fixed: "right",
            }
        }
        return {
            title: item,
            dataIndex: `${item}`,
            key: `${item}`,
            width: 150,
            ...obj,
            customRender: ({ text, record, column }) => {
                let className = ""
                const isNameTitle = column.title === NameText
                if (hasUsers.value) {
                    // 包含输入的用户名称
                    const isHasCurUser = state.formState.users.includes(record[NameText])

                    // 前两行标红
                    if (isHasCurUser) {
                        className = "text-danger"
                    }
                }

                return (
                    <div class={`text-custom ${className}`}>
                        <span class={isNameTitle && record.isAdd ? "text-danger" : ""}>{text || "-"}</span>
                        {isNameTitle && text && (
                            <a-button type="link" onClick={() => onClickAddName(text, record)}>
                                <PlusCircleOutlined />
                            </a-button>
                        )}
                    </div>
                )
            },
        }
    })
}

const onClickAddName = (name, record) => {
    const users = SearchFormRef.value.getUser()

    if (isFillArr(users) && users.includes(name)) {
        message.warning(`${name}已存在`)
        return
    }

    SearchFormRef.value.setUser(name)
    record.isAdd = true
    message.success(`${name}添加成功`)
}

const handleIphone = (iphone) => {
    return `${Number(iphone) - 1}`
}

const genTableList = (list) => {
    if (!isFillArr(list)) {
        return
    }
    const columnsTitle = state.columnsTitle

    const IphoneTitleIndexArr = []
    let NameIndex

    columnsTitle.forEach((title, index) => {
        if (IphoneTitleArr.includes(title)) {
            IphoneTitleIndexArr.push(index)
        }
        if (title === NameText) {
            NameIndex = index
        }
    })

    state.successUserLength = 0
    state.tableList = list
        .map((itemList, index) => {
            if (!isFillArr(itemList)) {
                return
            }
            let obj = {}

            const userName = itemList[NameIndex]
            let isHasCurUser = hasUsers.value ? state.formState.users.includes(userName) : false

            columnsTitle.forEach((title, index) => {
                let text = itemList[index]
                if (isHasCurUser && text && IphoneTitleArr.includes(title) && iphoneRegx.test(text)) {
                    text = handleIphone(text)
                    obj.isFlag = true
                    state.successUserLength++
                }

                obj[title] = text
            })
            return {
                key: index,
                ...obj,
            }
        })
        .filter(Boolean)
}
</script>
<style lang="less" scoped>
:deep(.text-danger) {
    color: red;
}
:deep(.text-custom) {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.result-user {
    display: inline-block;
    color: #1677ff;
    margin-bottom: 10px;
}
</style>
