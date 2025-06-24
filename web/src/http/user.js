/*jshint esversion: 9 */
import { service } from './request';
import qs from 'qs';

/** 公用接口 */
const allApi = {
    login() {
        // return service({
        //     url:"/public/captcha",
        //     method:'get',
        // });
        return Promise.resolve({
            msg: '操作成功',
            code: 200,
            token: 'eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6ImJmMmYyMWRlLTUwNzctNDUxNy1hYmRlLTA0NGE4NzNhMzE0ZSJ9.DOnUxWppbtKyJGlvSBZqdExf5hrt0EdWalanz_op7rvyc9v-itJJZXbW0xn_yS5SZfXLYn1BRMlTdxadUmRmAg',
        });
    },
    getUserInfo() {
        return Promise.resolve({
            msg: '操作成功',
            code: 200,
            data: {
                userName: 'admin',
                nickName: '管理员',
                avatar: 'https://s11.ax1x.com/2023/12/15/pihx4js.jpg',
            },
        });
    },
    getMenuList() {
        let menuList = [
            {
                name: 'main-index',
                title: '首页',
                content: '(有缓存，并且标签页固定)',
                isCache: true,
                fixed: true,
                iconName: 'svg:all-fill.svg',
            },
            {
                name: 'new-tag-page',
                title: '新标签页',
                isCache: true,
                hidden: true,
            },
            {
                name: 'main-401',
                title: '401页面',
                isCache: true,
                hidden: true,
            },
            {
                name: 'main-404',
                title: '404页面',
                isCache: true,
                hidden: true,
            },
            {
                name: 'main-mine-info',
                title: '个人中心',
                isCache: true,
                hidden: true,
            },
            {
                name: 'main-mine-info-update',
                title: '个人信息修改',
                isCache: true,
                hidden: true,
            },
            {
                name: 'main-mine-info-password',
                title: '修改密码',
                isCache: true,
                hidden: true,
            },
            {
                title: '客户管理',
                iconName: 'svg:cog-fill.svg',
                childs: [
                    // {
                    //     name: 'menu',
                    //     title: '菜单管理',
                    //     isCache: true,
                    //     content: '用户目录配置',
                    //     iconName: 'svg:alignleft-fill.svg',
                    //     showTagIcon: true,
                    // },
                    {
                        name: 'check-in',
                        title: '入住登记',
                        isCache: true,
                        content: '管理员',
                        iconName: '',
                        showTagIcon: true,
                    },
                    {
                        name: 'out-approval',
                        title: '外出审批',
                        isCache: true,
                        content: '管理员',
                        iconName: '',
                        showTagIcon: true,
                    },
                    {
                        name: 'check-out-approval',
                        title: '退住审批',
                        isCache: true,
                        content: '管理员',
                        //iconName: 'svg:borderverticle-fill.svg',
                        iconName: '',
                        showTagIcon: true,
                    },
                    {
                        name: 'user-list',
                        title: '外出登记',
                        isCache: true,
                        content: '',
                        iconName: 'svg:user-fill.svg',
                        showTagIcon: true,
                    },
                    {
                        name: 'role-list',
                        title: '退住登记',
                        isCache: true,
                        content: '',
                        iconName: 'svg:user-group-fill.svg',
                        showTagIcon: true,
                    },
                ],
            },
            {
                title: '健康管家',
                iconName: 'svg:laptop-check.svg',
                childs: [
                    {
                        name: 'set-target',
                        title: '设置服务对象',
                        isCache: true,
                        content: '添加、管理服务对象',
                        iconName: 'svg:user-fill.svg',
                        showTagIcon: true,
                    },
                    {
                        name: 'manage-client',
                        title: '设置服务对象-客户管理',
                        isCache: true,
                        content: '',
                        iconName: 'svg:care_Item.svg',
                        showTagIcon: true,
                        hidden:true,
                    },
                    {
                        name: 'service-focus',
                        title: '服务关注',
                        isCache: true,
                        content: '查看和管理关注的服务项',
                        iconName: 'svg:user-fill.svg',
                        showTagIcon: true,
                    },
                    {
                        name: 'care-config',
                        title: '服务关注-项目配置',
                        isCache: true,
                        content: '',
                        iconName: 'svg:care_Item.svg',
                        showTagIcon: true,
                        hidden:true,
                    },
                ]
            },

            {
                name: 'merge-table',
                title: '床位管理',
                iconName: 'svg:laptop-check.svg',
                childs:[
                    {
                        name: 'beds-show',
                        title: '床位示意图',
                        isCache: true,
                        content: '',
                        iconName: 'svg:borderverticle-fill.svg',
                        showTagIcon: true,
                    },
                    {
                        name: 'beds-manage',
                        title: '床位管理',
                        isCache: true,
                        content: '',
                        iconName: 'svg:borderverticle-fill.svg',
                        showTagIcon: true,
                    },
                    
                ],
            },
                  {
                title: '护理管理',
                iconName: 'svg:cog-fill.svg',
                childs: [
                    {
                        name: 'care-level',
                        title: '护理级别',
                        isCache: true,
                        content: '',
                        iconName: 'svg:care_level.svg',
                        showTagIcon: true,
                    },
                    {
                        name: 'care-level-Item',
                        title: '护理级别-项目配置',
                        isCache: true,
                        content: '',
                        iconName: 'svg:care_Item.svg',
                        showTagIcon: true,
                        hidden:true,
                    },
                    {
                        name: 'care-Item',
                        title: '护理项目',
                        isCache: true,
                        content: '',
                        iconName: 'svg:care_Item.svg',
                        showTagIcon: true,
                    },
                    {
                        name: 'client-care',
                        title: '客户护理设置',
                        isCache: true,
                        content: '',
                        iconName: 'svg:user-group-fill.svg',
                        showTagIcon: true,
                    },
                    {
                        name: 'care-record',
                        title: '护理记录',
                        isCache: true,
                        content: '',
                        iconName: 'svg:user-group-fill.svg',
                        showTagIcon: true,
                    },
                ],
            },
            {
                name: 'other-view',
                title: '其他功能展示',
                iconName: 'svg:map-fill.svg',
                isCache: true,
            },
            
            {
                name: 'show-list-info',
                title: '数据详情',
                hidden: true,
                iconName: 'svg:all-fill.svg',
            },
            {
                name: 'show-list-add',
                title: '数据添加',
                hidden: true,
                iconName: 'svg:Navbar-full.svg',
            },
            {
                name: 'show-list-update',
                title: '数据编辑',
                hidden: true,
                isCache: true,
                content: '(有缓存)',
                iconName: 'svg:Navbar-full.svg',
            },


            {
                name: 'mine',
                title: '个人中心',
                isCache: true,
                content: '(有缓存)',
                hidden: true,
                iconName: 'svg:Navbar-full.svg',
            },
            // {
            //     name: 'setup-tag',
            //     title: '设置标签页',
            //     isCache: true,
            //     content: '(有缓存)',
            //     hidden: false,
            //     iconName: 'svg:tag.svg',
            // },


        ];
        return Promise.resolve({
            msg: '操作成功',
            code: 200,
            data: menuList,
        });
    },
};

export default allApi;
