/**
 * 路由列表部分
 * 所有路由必须先手动写好，然后由后端菜单接口来进行匹配并且指定是否显示
 */
import { createWebHistory, createRouter, createWebHashHistory } from 'vue-router';
/**
 * 为路由配置meta相当于为该路由配置了基本信息，配置的属性如下
 * title 用作标签显示字样的字段
 * hasTag 可以生成标签
 * isCache 该标签页面是否缓存
 * hidden 该标签页面是否在左边目录上显示
 * isLink 表示直接跳转新页面
 * iconName 菜单icon图标
 * fixed 标签是否固定
 * layoutName layout的名称，用作分组
 * redirectName 重定向的目标
 * path 路由地址，唯一键
 * fullPath
 * showTagIcon 标签显示的时候是否显示图标
 * content 菜单显示的详情
 * number 菜单显示的数字
 */
export const constantRoutes = [
    /** 登录注册相关页面 */
    {
        path: '/login',
        component: () => import('@/views/login/index.vue'),
    },
    /** 404页面 */
    {
        path: '/404',
        component: () => import('@/views/system/error/404.vue'),
        name: '404',
    },
    /** 401页面 */
    {
        path: '/401',
        component: () => import('@/views/system/error/401.vue'),
        name: '401',
    },
    /** 定义首页重定向地址 */
    {
        path: '',
        redirect: '/main/index',
    },
    /** 其他业务相关页面 */
    {
        path: '/main',
        component: () => import('@/layout/main/index.vue'),
        children: [
            /**
             * 重定向页面
             * 用来刷新标签页
             *  */
            {
                path: 'redirect/:path(.*)',
                name: 'main-redirect',
                component: () => import('@/views/system/redirect/index.vue'),
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                },
            },
            {
                path: '401',
                name: 'main-401',
                component: () => import('@/views/system/error/401.vue'),
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                    title: '401',
                },
            },
            {
                path: '404',
                name: 'main-404',
                component: () => import('@/views/system/error/404.vue'),
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                    title: '404',
                },
            },
            {
                path: 'new-tag-page/:sign',
                component: () => import('@/views/system/newTagPage/index.vue'),
                name: 'new-tag-page',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                    title: '新标签',
                },
            },
            /** 一些页面例子 */
            {
                path: 'helper-daily',
                component: () => import('@/views/healthManage/clientCare/index.vue'),
                name: 'helper-daily',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'helper-checkout',
                component: () => import('@/views/healthManage/helperCheckOutRequest/index.vue'),
                name: 'helper-checkout',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'helper-out',
                component: () => import('@/views/healthManage/helperOutRoom/index.vue'),
                name: 'helper-out',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'helper-care-record',
                component: () => import('@/views/healthManage/helperCareRecord/index.vue'),
                name: 'helper-care-record',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'index',
                component: () => import('@/views/system/main/index.vue'),
                name: 'main-index',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'show-list',
                component: () => import('@/views/exampleViews/showList/index.vue'),
                name: 'show-list',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'show-list/add',
                component: () => import('@/views/exampleViews/showList/add.vue'),
                name: 'show-list-add',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'show-list/update/:sign',
                component: () => import('@/views/exampleViews/showList/add.vue'),
                name: 'show-list-update',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'show-list/info/:sign',
                component: () => import('@/views/exampleViews/showList/info.vue'),
                name: 'show-list-info',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'user-list',
                component: () => import('@/views/exampleViews/userList/index.vue'),
                name: 'user-list',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
             {
                path: 'client/check-in',
                component: () => import('@/views/client/checkIn/index.vue'),
                name: 'check-in',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'care-level',
                component: () => import('@/views/careManage/carelevel/index.vue'),
                name: 'care-level',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
             {
                path: 'care-Item',
                component: () => import('@/views/careManage/careItem/index.vue'),
                name: 'care-Item',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
           {
                path: 'care-level-Item',
                component: () => import('@/views/careManage/carelevel/ProjectConfig.vue'),
                name: 'care-level-Item',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: false,
                },
            },
            {
                path: 'daily-care',
                component: () => import('@/views/healthManage/clientCare/components/dailyCare.vue'),
                name: 'daily-care',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: false,
                },
            },
            {
                path: 'check-out-detail',
                component: () => import('@/views/healthManage/helperCheckOutRequest/components/CheckOutRequest.vue'),
                name: 'check-out-detail',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: false,
                },
            },
             {
                path: 'check-out-room',
                component: () => import('@/views/healthManage/helperOutRoom/components/CheckOutRequest.vue'),
                name: 'check-out-room',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: false,
                },
            },
            {
                path: 'check-care-record',
                component: () => import('@/views/healthManage/helperCareRecord/components/CareRecordDialog.vue'),
                name: 'check-care-record',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: false,
                },
            },
            {
                path: 'care-record',
                component: () => import('@/views/careManage/careRecord/index.vue'),
                name: 'care-record',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: false,
                },
            },
            {
                path: 'client-care',
                component: () => import('@/views/careManage/clientCareConfig/index.vue'),
                name: 'client-care',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: false,
                },
            },
            {
                path: 'client/check-out-approval',
                component: () => import('@/views/client/checkOut/index.vue'),
                name: 'check-out-approval',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'client/out-approval',
                component: () => import('@/views/client/out/index.vue'),
                name: 'out-approval',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'set-target',
                component: () => import('@/views/careGiver/cgAllocate/index.vue'),
                name: 'set-target',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'manage-client',
                component: () => import('@/views/careGiver/cgAllocate/clientManagement.vue'),
                name: 'manage-client',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'care-config',
                component: () => import('@/views/careGiver/careConfig/clientCareConfig.vue'),
                name: 'care-config',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },

            {
                path: 'service-focus',
                component: () => import('@/views/careGiver/careConfig/index.vue'),
                name: 'service-focus',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
             {
                path: 'care-level',
                component: () => import('@/views/careManage/carelevel/index.vue'),
                name: 'care-level',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
             {
                path: 'care-Item',
                component: () => import('@/views/careManage/careItem/index.vue'),
                name: 'care-Item',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
           {
                path: 'care-level-Item',
                component: () => import('@/views/careManage/carelevel/ProjectConfig.vue'),
                name: 'care-level-Item',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
             {
                path: 'user-manage',
                component: () => import('@/views/userManage/index.vue'),
                name: 'user-manage',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'food-manage',
                component: () => import('@/views/foodManage/index.vue'),
                name: 'food-manage',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'role-list',
                component: () => import('@/views/exampleViews/roleList/index.vue'),
                name: 'role-list',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'icon-list',
                component: () => import('@/views/system/iconList/index.vue'),
                name: 'icon-list',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'mine',
                component: () => import('@/views/system/mine/index.vue'),
                name: 'mine',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'setup-tag',
                component: () => import('@/views/exampleViews/setupTag/index.vue'),
                name: 'setup-tag',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'setup-menu',
                component: () => import('@/views/exampleViews/setupMenu/index.vue'),
                name: 'setup-menu',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
     /**       {
                path: 'system/menu',
                component: () => import('@/views/exampleViews/menu/index.vue'),
                name: 'menu',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },*/ 
            {
                path: 'system/bt-permission',
                component: () => import('@/views/exampleViews/btPermission/index.vue'),
                name: 'bt-permission',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'iframe/:sign(.*)',
                component: () => import('@/views/system/iframe/index.vue'),
                name: 'iframe',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'other-view',
                component: () => import('@/views/exampleViews/otherView/index.vue'),
                name: 'other-view',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'merge-table',
                component: () => import('@/views/exampleViews/mergeTable/index.vue'),
                name: 'merge-table',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'big-screen/show_1',
                component: () => import('@/views/bigScreen/show_1/index.vue'),
                name: 'main-big-screen',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                },
            },
            {
                path: 'mine/info',
                component: () => import('@/views/system/mine/index.vue'),
                name: 'main-mine-info',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                    title: '个人中心',
                },
            },
            {
                path: 'mine/info-update',
                component: () => import('@/views/system/mine/update.vue'),
                name: 'main-mine-info-update',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                    title: '修改个人信息',
                },
            },
            {
                path: 'mine/info-password',
                component: () => import('@/views/system/mine/password.vue'),
                name: 'main-mine-info-password',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                    title: '修改密码',
                },
            },
            {
                path: 'beds-show',
                component: () => import('@/views/bed/view/bedShow/index.vue'),
                name: 'beds-show',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                    title: '床位示意图',
                },
            },
            {
                path: 'beds-manage',
                component: () => import('@/views/bed/view/bedUsages/index.vue'),
                name: 'beds-manage',
                meta: {
                    layoutName: 'main',
                    redirectName: 'main-redirect',
                    hasTag: true,
                    title: '床位管理',
                },
            },
        ],
    },

];

const router = createRouter({
    history: createWebHistory(import.meta.env.VITE_APP_routeBasePath),
    routes: constantRoutes,
});

export default router;
