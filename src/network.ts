import Taro from '@tarojs/taro'

/**
 * 网络请求模块
 * 封装 Taro.request、Taro.uploadFile、Taro.downloadFile，自动添加项目域名前缀
 * 如果请求的 url 以 http:// 或 https:// 开头，则不会添加域名前缀
 * 如果 PROJECT_DOMAIN 为 "/"，则使用相对路径，让 vite 代理处理
 *
 * IMPORTANT: 项目已经全局注入 PROJECT_DOMAIN
 * IMPORTANT: 除非你需要添加全局参数，如给所有请求加上 header，否则不能修改此文件
 */
export namespace Network {
    const createUrl = (url: string): string => {
        // 如果已经是完整 URL，直接返回
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url
        }
        // 如果 PROJECT_DOMAIN 为 "/"，使用相对路径（让 vite 代理处理）
        if (PROJECT_DOMAIN === '/') {
            return url
        }
        // 否则添加 PROJECT_DOMAIN 前缀
        return `${PROJECT_DOMAIN}${url}`
    }

    const getAuthHeader = (): Record<string, string> => {
        const token = Taro.getStorageSync('token')
        return token ? { 'Authorization': `Bearer ${token}` } : {}
    }

    export const request: typeof Taro.request = option => {
        const fullUrl = createUrl(option.url)
        console.log('[Network] Request:', {
            originalUrl: option.url,
            fullUrl: fullUrl,
            method: option.method || 'GET',
            data: option.data,
            domain: PROJECT_DOMAIN,
        })

        // GET 请求不设置 Content-Type
        const isGet = (option.method || 'GET').toUpperCase() === 'GET'

        return Taro.request({
            ...option,
            url: fullUrl,
            dataType: 'json',
            timeout: 30000, // 30 秒超时（应对冷启动）
            header: {
                ...option.header,
                ...(isGet ? {} : { 'Content-Type': 'application/json' }),
                ...getAuthHeader(),
            },
        }).then(response => {
            console.log('[Network] Response:', {
                url: fullUrl,
                statusCode: response.statusCode,
                data: response.data,
                header: response.header,
            })

            // 检查响应状态码
            if (response.statusCode >= 400) {
                console.error('[Network] Error Response:', {
                    statusCode: response.statusCode,
                    data: response.data,
                })
            }

            return response
        }).catch(error => {
            console.error('[Network] Request Failed:', {
                url: fullUrl,
                error: error,
                errMsg: error.errMsg,
            })
            throw error
        }) as any
    }

    export const uploadFile: typeof Taro.uploadFile = option => {
        console.log('Network.uploadFile:', {
            url: createUrl(option.url),
            filePath: option.filePath
        })
        return Taro.uploadFile({
            ...option,
            url: createUrl(option.url),
            header: {
                ...option.header,
                ...getAuthHeader(),
            },
        })
    }

    export const downloadFile: typeof Taro.downloadFile = option => {
        console.log('Network.downloadFile:', {
            url: createUrl(option.url)
        })
        return Taro.downloadFile({
            ...option,
            url: createUrl(option.url),
            header: {
                ...option.header,
                ...getAuthHeader(),
            },
        })
    }
}
