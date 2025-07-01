/*jshint esversion: 9 */
import { service } from './request';
import qs from 'qs';
import { userDataStore } from '@/store/user';

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
    const userStore = userDataStore();
    const roleId = userStore.roleId;
    console.log("菜单能看到roleId吗", roleId);

    // 公共菜单（所有人都能看到）
    const commonMenus = [
        {
            name: 'main-index',
            title: '首页',
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
    ];

    // 护工专属菜单
    const caregiverMenus = [
        {
            title: '客户管理-护工',
            iconName: 'svg:caregiver.svg',
            childs: [
                {
                    name: 'helper-out',
                    title: '退住申请',
                    isCache: true,
                    iconName: 'svg:set-care-client.svg',
                    showTagIcon: true,
                },
                {
                    name: 'helper-checkout',
                    title: '外出申请',
                    isCache: true,
                    content: '',
                    iconName: 'svg:care_Item.svg',
                    showTagIcon: true,
                },
            ],
        },
        {
            title: '健康管家-护工',
            iconName: 'svg:caregiver.svg',
            childs: [
                {
                    name: 'helper-daily',
                    title: '日常护理',
                    isCache: true,
                    iconName: 'svg:set-care-client.svg',
                    showTagIcon: true,
                },
                 {
                    name: 'daily-care',
                    title: '护理-日常',
                    isCache: true,
                    iconName: 'svg:set-care-client.svg',
                    showTagIcon: true,
                    hidden:true,
                },
                {
                    name: 'check-care-record',
                    title: '护理-记录',
                    isCache: true,
                    iconName: 'svg:set-care-client.svg',
                    showTagIcon: true,
                    hidden:true,
                },      
                {
                    name: 'check-out-detail',
                    title: '护理-外出申请',
                    isCache: true,
                    iconName: 'svg:set-care-client.svg',
                    showTagIcon: true,
                    hidden:true,
                },          
                {
                    name: 'check-out-room',
                    title: '护理-退住申请',
                    isCache: true,
                    iconName: 'svg:set-care-client.svg',
                    showTagIcon: true,
                    hidden:true,
                },
                {
                    name: 'helper-care-record',
                    title: '服务对象护理记录',
                    isCache: true,
                    content: '',
                    iconName: 'svg:care_Item.svg',
                    showTagIcon: true,
                },
            ]
        }
    ];

    // 管理员等角色完整菜单（排除护工模块）
    const fullMenusExcludingCaregiver = [
        {
            name: 'merge-table',
            title: '床位管理',
            iconName: 'svg:bed-manage.svg',
            childs: [
                {
                    name: 'beds-show',
                    title: '床位示意图',
                    isCache: true,
                    iconName: 'svg:bed-picture.svg',
                    showTagIcon: true,
                },
                {
                    name: 'beds-manage',
                    title: '床位管理',
                    isCache: true,
                    iconName: 'svg:bed-change.svg',
                    showTagIcon: true,
                },
            ],
        },
        {
            title: '客户管理',
            iconName: 'svg:client-manage.svg',
            childs: [
                {
                    name: 'check-in',
                    title: '入住登记',
                    isCache: true,
                    iconName: 'svg:user-in.svg',
                    showTagIcon: true,
                },
                {
                    name: 'out-approval',
                    title: '外出审批',
                    isCache: true,
                    iconName: 'svg:out-check.svg',
                    showTagIcon: true,
                },
                {
                    name: 'check-out-approval',
                    title: '退住审批',
                    isCache: true,
                    iconName: 'svg:roomout-check.svg',
                    showTagIcon: true,
                },
                {
                    name: 'user-list',
                    title: '外出登记',
                    isCache: true,
                    iconName: 'svg:user-fill.svg',
                    showTagIcon: true,
                    hidden: true,
                },
                {
                    name: 'role-list',
                    title: '退住登记',
                    isCache: true,
                    iconName: 'svg:user-group-fill.svg',
                    showTagIcon: true,
                    hidden: true,
                },
            ],
        },
        {
            title: '健康管家',
            iconName: 'svg:caregiver.svg',
            childs: [
                {
                    name: 'set-target',
                    title: '设置服务对象',
                    isCache: true,
                    iconName: 'svg:set-care-client.svg',
                    showTagIcon: true,
                },
                {
                    name: 'manage-client',
                    title: '设置服务对象-客户管理',
                    isCache: true,
                    iconName: 'svg:care_Item.svg',
                    showTagIcon: true,
                    hidden: true,
                },
                {
                    name: 'service-focus',
                    title: '服务关注',
                    isCache: true,
                    iconName: 'svg:service-care.svg',
                    showTagIcon: true,
                },
                {
                    name: 'care-config',
                    title: '服务关注-项目配置',
                    isCache: true,
                    iconName: 'svg:care_Item.svg',
                    showTagIcon: true,
                    hidden: true,
                },
            ]
        },
        {
            title: '护理管理',
            iconName: 'svg:care-manage.svg',
            childs: [
                {
                    name: 'care-level',
                    title: '护理级别',
                    isCache: true,
                    iconName: 'svg:care_level.svg',
                    showTagIcon: true,
                },
                {
                    name: 'care-level-Item',
                    title: '护理级别-项目配置',
                    isCache: true,
                    iconName: 'svg:care_Item.svg',
                    showTagIcon: true,
                    hidden: true,
                },
                {
                    name: 'care-Item',
                    title: '护理项目',
                    isCache: true,
                    iconName: 'svg:care_Item.svg',
                    showTagIcon: true,
                },
                {
                    name: 'client-care',
                    title: '客户护理设置',
                    isCache: true,
                    iconName: 'svg:user-group-fill.svg',
                    showTagIcon: true,
                },
                {
                    name: 'care-record',
                    title: '护理记录',
                    isCache: true,
                    iconName: 'svg:care-record.svg',
                    showTagIcon: true,
                },
            ],
        },
        {
            title: '用户管理',
            iconName: 'svg:user-manage.svg',
            childs: [
                {
                    name: 'user-manage',
                    title: '用户基础数据维护',
                    isCache: true,
                    iconName: 'svg:user-data.svg',
                    showTagIcon: true,
                }
            ],
        },
        {
            title: '膳食管理',
            iconName: 'svg:foodManage.svg',
            childs: [
                {
                    name: 'food-manage',
                    title: '食尚-你的ai小助手',
                    isCache: true,
                    iconName: 'svg:aifood.svg',
                    showTagIcon: true,
                }
            ],
        },
        {
            name: 'mine',
            title: '个人中心',
            isCache: true,
            hidden: true,
            iconName: 'svg:Navbar-full.svg',
        },
    ];

    let finalMenus = [];

    if (roleId === 1) {
        // 管理员不看护工模块
        finalMenus = [...commonMenus, ...fullMenusExcludingCaregiver];
    } else if (roleId === 4) {
        // 护工只看护工菜单
        finalMenus = [...commonMenus, ...caregiverMenus];
    } else {
        // 其他角色看到全部
        finalMenus = [...commonMenus, ...fullMenusExcludingCaregiver, ...caregiverMenus];
    }

    return Promise.resolve({
        msg: '操作成功',
        code: 200,
        data: finalMenus,
    });
}
};

export default allApi;
