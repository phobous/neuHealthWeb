import axios from 'axios'

export function download(url, params, filename = 'export.xlsx') {
    axios({
        url: url,
        method: 'get',
        params,
        responseType: 'blob'
    }).then(response => {
        const blob = new Blob([response.data])
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }).catch(err => {
        console.error('下载失败', err)
    })
}