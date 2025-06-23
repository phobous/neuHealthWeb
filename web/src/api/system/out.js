import request from '@/utils/request'

// 查询外出申请列表
export function listOut(query) {
    return request({
        url: '/out/findAll',
        method: 'get',
        params: query
    })
}

// 分页查询
export function getOutPage(query) {
    return request({
        url: '/out/page',
        method: 'get',
        params: query
    })
}

// 查询外出申请详细
// 根据姓名
export function getOut(name) {
    return request({
        url: '/out',
        method: 'get',
        params: {
            name: name
        }
    })
}

// 新增外出申请
export function addOut(data) {
    return request({
        url: '/out',
        method: 'post',
        data: data
    })
}

// 修改外出申请
export function updateOut(data) {
    return request({
        url: '/out',
        method: 'put',
        data: data
    })
}

// 删除外出申请
export function delOut(id) {
    return request({
        url: '/out/' + id,
        method: 'delete'
    })
}

//审核
export function review(data) {
    return request({
        url: '/out/review',
        method: 'post',
        data: data
    })
}
