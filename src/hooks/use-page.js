import { ref, watchEffect } from 'vue'

const Current = 1
const PageSize = 40
export default function usePage(state) {


    const current = ref(Current);
    const pageSize = ref(PageSize);
    const data = ref([])

    watchEffect(() => {
        data.value = state.tableList
    })

    const run = (page) => {
        current.value = page.current;
        pageSize.value = page.pageSize;
    }

    const resetPage = () => {
        current.value = Current;
        pageSize.value = PageSize;
    }

    return ({
        current, pageSize, data, run, resetPage
    })
}