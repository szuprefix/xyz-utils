
import { ref, getCurrentInstance } from 'vue'
import { format } from 'date-fns'

function joinErrors(errors) {
    const es = {}
    for (const n in errors) {
        es[n] = errors[n].join('')
    }
    return es
}

function formatDates(data) {
    const rs = {}
    for (const n in data) {
        const d = data[n]
        if (d instanceof Date) {
            // 注意：date-fns v2+ 使用 yyyy-MM-dd（小写 y）
            rs[n] = format(d, 'yyyy-MM-DD')
        } else {
            rs[n] = d
        }
    }
    return rs
}

export function useSubmit(restStyle = false) {
    const loading = ref(false)
    const loadingText = ref('数据加载中...')
    const serverResponseError = ref(undefined)

    const instance = getCurrentInstance()
    if (!instance) {
        throw new Error('useSubmit must be called inside setup()')
    }

    const $http = instance.appContext.config.globalProperties.$http
    const $message = instance.appContext.config.globalProperties.$message
    const $store = instance.appContext.config.globalProperties.$store

    function alertError(error) {
        $message({
            message: `${error.code}错误:${error.msg}`,
            type: 'error'
        })
    }

    function onServerResponseError(error) {
        loading.value = false
        if (error === 'cancel') {
            return
        }

        if ([404, 403, 405, 406, 429, 537].includes(error.code) && error.msg?.detail) {
            error.msg = error.msg.detail
        }

        console.error(error)

        if (error.code === 400) {
            // 可根据需要暴露 errors，例如通过返回值或额外 ref
            // errors.value = joinErrors(error.msg)
        } else if (error.code === 401) {
            $store.state.bus?.$emit('user-logout')
        } else if (error.code === 502) {
            alertError({ code: 502, msg: '网关错误' })
        } else if (error instanceof Error) {
            alertError({ code: error.name, msg: error.message })
        } else {
            alertError(error)
        }

        return error
    }

    const objToQueryString = obj => {
        const params = new URLSearchParams();
        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                // 处理数组或简单值，URLSearchParams 会自动处理编码
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, v));
                } else if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            }
        }
        return params.toString();
    };

    async function submitData(url, data, successMsg, isCreate = false) {
        loading.value = true
        // 如果需要处理表单错误，可在此初始化 errors
        // const errors = ref({})

        const action = isCreate ? $http.post : $http.put
        const dt = restStyle ? data : objToQueryString(formatDates(data))

        try {
            const response = await action(url, dt)
            const responseData = response.data

            loading.value = false

            // 兼容非 REST 风格（code !== 0 表示失败）
            if (!restStyle && responseData.code !== 0) {
                const err = { code: 400, msg: responseData.data?.errors || '未知错误' }
                throw err
            }

            $message({ message: successMsg || '提交成功', type: 'success' })
            return responseData
        } catch (error) {
            return onServerResponseError(error)
        }
    }

    return {
        loading,
        loadingText,
        serverResponseError,
        submitData,
        joinErrors, // 如需外部调用
        onServerResponseError,
        alertError
    }
}
