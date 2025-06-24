import request from '@/utils/request'

// 查询客户/老人基本信息列表
export function listClients(query) {
  return request({
    url: '/clients/active',
    method: 'get',
    params: query
  })
}

// 分页查询
export function getClientPage(query) {
  return request({
    url: '/clients/page',
    method: 'get',
    params: query
  })
}

//多表联查分页
export function getClientsWithRoomPage(params) {
    // params 是对象，包含 pageNum, pageSize, name, type 等
    return request({
        url: '/clients/with-room/page',
        method: 'get',
        params
    })
}
//根据房间号查找床位号
export function getBedByRoom(roomId) {
  return request({
    url: '/clients/with-room/by-room',
    method: 'get',
    params: {
      roomId
    }
  })
}

// 根据姓名和类型查询客户/老人基本信息详细
export function getClients(name, type) {
  return request({
    url: '/clients',
    method: 'get',
    params: {
      name: name,
      type: type
    }
  })
}

// 新增客户/老人基本信息
export function addClients(data) {
  return request({
    url: '/clients',
    method: 'post',
    data: data
  })
}

// 修改客户/老人基本信息
export function updateClients(data) {
  return request({
    url: '/clients',
    method: 'put',
    data: data
  })
}

// 删除客户/老人基本信息
export function delClient(id) {
  return request({
    url: '/clients/' + id,
    method: 'delete'
  })
}

// 批量删除
export function delClients(ids) {
  return request({
    url: '/clients/batch',
    method: 'delete',
    data: ids //传入数组，放在请求体中
  })
}

