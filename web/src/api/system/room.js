import request from '@/utils/request'
export function getAllRooms() {
    return request({
        url: '/rooms/findAll',
        method: 'get'
    })
}