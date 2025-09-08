export function download(url, fileName) {
    let req = new XMLHttpRequest()
    req.open('GET', url, true)
    req.responseType = 'blob'
    return new Promise((resolve) => {
        req.onload = () => {
            save(req.response, fileName)
            resolve(req.response)
        }
        req.send()
    })
}
export function save(blob, fileName) {
    let a = document.createElement('a')
    let url = window.URL.createObjectURL(blob)
    let filename = fileName || 'response.data'
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
}
