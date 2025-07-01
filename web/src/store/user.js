/** 用户全局数据 */
import { defineStore } from 'pinia';
import allStorage from '@/action/storageManage';

const tagsMapStorage = allStorage.tagsMapStorage();
const userStorage = allStorage.userStorage();

export const userDataStore = defineStore('userDataStore', {
  state: () => {
    /** 从本地缓存初始化 userInfo */
    let userInfo = userStorage.value;
    if (typeof userInfo !== 'object') {
      userInfo = {};
    }

    /** 从缓存初始化 tagsMap */
    let tagsMap = tagsMapStorage.value;
    if (typeof tagsMap !== 'object') {
      tagsMap = {};
    }

    return {
      userInfo: userInfo || {}, // 当前登录用户的基础数据（含 roleId）
      userMenuConfigNameMap: {}, // 目录名权限
      userMenuConfigPathMap: {}, // 目录路径权限
      userMenuSignMap: {}, // 唯一标识权限
      userMenuList: [], // 展示用的树形菜单
      permissionList: [], // 按钮权限字符串
      tagsMap: tagsMap, // 页面标签MAP，layoutName为键名
      iframeList: [], // iframe页面数组
    };
  },

  getters: {
    /** ✅ 新增：直接获取角色 ID */
    roleId: (state) => state.userInfo?.roleId || null,
     /** ✅ 获取 caregiverId，仅当 roleId 为 4 时 */
    caregiverId: (state) => {
      return state.userInfo?.roleId === 4 ? state.userInfo?.caregiverId || null : null;
    },
    reviewerId: (state) => {
      return state.userInfo?.roleId === 1 ? state.userInfo?.reviewerId || null : null;
    },
  },

  actions: {
    /** ✅ 登录后调用，保存用户信息并缓存（含 token、roleId） */
    setUserInfo(value) {
      this.userInfo = value || {};

      /** 存入缓存 */
      const userStorage = allStorage.userStorage();
      userStorage.value = value;
    },

    setUserMenuConfigNameMap(value) {
      this.userMenuConfigNameMap = value || {};
    },

    setUserMenuConfigPathMap(value) {
      this.userMenuConfigPathMap = value || {};
    },

    setUserMenuSignMap(value) {
      this.userMenuSignMap = value || {};
    },

    setPermissionList(value) {
      this.permissionList = value || [];
    },

    setUserMenuList(value) {
      this.userMenuList = value || [];
    },

    setTagsMap(value) {
      this.tagsMap = value || {};
      tagsMapStorage.value = this.tagsMap;
    },

    setIframeList(value) {
      this.iframeList = value || [];
    },
  },
});
