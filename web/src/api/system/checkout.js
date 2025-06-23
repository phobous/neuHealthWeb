import request from '@/utils/request'

// 查询退住申请列表
export function listRequests(query) {
    return request({
        url: '/checkout/findAll',
        method: 'get',
        params: query
    })
}

// 查询退住申请详细
// 根据姓名
export function getCheckout(name) {
    return request({
        url: '/checkout',
        method: 'get',
        params: {
            name: name
        }
    })
}

// 新增退住申请
export function addRequests(data) {
    return request({
        url: '/checkout',
        method: 'post',
        data: data
    })
}

// 修改退住申请
export function updateRequests(data) {
    return request({
        url: '/checkout',
        method: 'put',
        data: data
    })
}

// 删除退住申请
export function delRequests(id) {
    return request({
        url: '/checkout' + id,
        method: 'delete'
    })
}

//审核
export function review(data) {
    return request({
        url: '/checkout/review',
        method: 'post',
        data: data
    })
}