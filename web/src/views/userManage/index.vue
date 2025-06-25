<template>
    <div class="page-container main-view">
        <el-row
            :gutter="0"
            v-show="dataContainer.showSearch"
            class="page-query-box">
            <el-col :span="24" :xs="24">
                <el-form
                    :model="dataContainer.form"
                    ref="QueryFormRef"
                    :inline="true"
                    label-width="110px">
                    <el-row :gutter="0">
                        <el-col :span="6" :xs="6">
                            <el-form-item label="姓名" prop="realName"> <!-- 修改为 realName -->
                                <el-input
                                    v-model="dataContainer.form.realName" 
                                    placeholder="请输入姓名"
                                    clearable
                                    @clear="handleQuery"
                                    @keyup.enter="handleQuery"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6" :xs="6" class="query-buttons">
                            <el-form-item label=" ">
                                <el-button
                                    type="primary"
                                    @click="handleQuery">
                                    <SvgIcon 
                                        :style="'width:15px;height:15px;margin-right:5px;'"
                                        name="svg:search-bt.svg"></SvgIcon>
                                    查询
                                </el-button>
                                <el-button
                                    @click="resetQuery">
                                    <SvgIcon 
                                        :style="'width:15px;height:15px;margin-right:10px;'"
                                        name="svg:redo.svg"></SvgIcon>
                                    重置
                                </el-button>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </el-col>
        </el-row>
        <div class="table-box content-container page-content-box">
            <div class="top-container">
                <div class="left">
                    <el-button
                        v-if="hasPermi(['yx:checkin:add'])"
                        type="primary"
                        @click="handleAdd">
                        添加
                    </el-button>
                    <el-button
                        plain
                        type="primary" 
                        @click="handleExport">
                        导出
                    </el-button>
                    <el-button
                        plain
                        type="danger"
                        v-if="dataContainer.selectedIds.length > 0"
                        @click="handleBatchDelete">
                        批量删除
                    </el-button>
                </div>
                <div class="right">
                    <el-button
                        circle 
                        @click="resetQuery">
                        <SvgIcon 
                            :style="'width:15px;height:15px;'"
                            name="svg:redo.svg"></SvgIcon>
                    </el-button>
                    <el-button
                        circle 
                        @click="dataContainer.showSearch=!dataContainer.showSearch">
                        <SvgIcon 
                            :style="'width:15px;height:15px;'"
                            name="svg:search-bt.svg"></SvgIcon>
                    </el-button>
                </div>
            </div>
            <div class="table-container">
                <el-table
                    v-loading="dataContainer.loading"
                    :data="dataContainer.currDataList"
                    border
                    @cell-dblclick="handleCopyVale"
                    @sort-change="handleSortChange"
                    @selection-change="handleSelectionChange"
                    height="100%">
                    <el-table-column
                        type="selection"
                        width="55"
                        align="center"/>
                    <el-table-column
                        label="序号"
                        show-overflow-tooltip
                        align="center"
                        min-width="60"
                        prop="id"/>
                    <el-table-column
                        label="用户名"
                        show-overflow-tooltip
                        align="center"
                        min-width="120"
                        prop="username"/>
                    <el-table-column
                        label="电话"
                        show-overflow-tooltip
                        align="center"
                        min-width="150"
                        prop="phone"/>
                    <el-table-column
                        label="性别"
                        show-overflow-tooltip
                        align="center"
                        min-width="100"
                        prop="gender"/>
                    <el-table-column
                        label="真实姓名"
                        show-overflow-tooltip
                        align="center"
                        min-width="120"
                        prop="realName"/>

                    <el-table-column
                        label="邮箱"
                        show-overflow-tooltip
                        align="center"
                        min-width="180"
                        prop="email"/>
                    <el-table-column
                        label="员工类型"
                        show-overflow-tooltip
                        align="center"
                        min-width="150"
                        prop="roleName"/>
                    <el-table-column
                        label="操作"
                        width="200"
                        fixed="right"
                        class-name="small-padding fixed-width">
                        <template #default="scope">
                            <el-button
                                :text="true"
                                @click="handleDetails(scope.row,{
                                    isShow:true,
                                    afterTitle:' - 查看详情',
                                })">
                                查看
                            </el-button>
                            <el-button
                                :text="true"
                                @click="handleEdit(scope.row,{
                                    isShow:false,
                                    afterTitle:' - 编辑',
                                })">
                                修改
                            </el-button>
                            <el-button
                                :text="true"
                                type="danger"
                                @click="handleDelete([scope.row.id])">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="pagination-container">
                <el-pagination
                    v-show="true"
                    :total="dataContainer.config.total"
                    :background="true"
                    :current-page="dataContainer.params.pageNum"
                    :page-size="dataContainer.params.pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :page-sizes="[10, 20, 30, 50]"
                    :pager-count="7"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </div>

        <AddDataDialog
            ref="AddDataDialogRef"></AddDataDialog>
    </div>
</template>


<script>
import axios from 'axios';
import {defineComponent,onBeforeUnmount,ref,reactive,getCurrentInstance,onActivated,computed } from 'vue';
import { useRouter } from "vue-router";
import { copyValue } from '@/common/OtherTools';
import DictTags from '@/components/DictTags.vue';
import {debounceFn} from "@/common/DebounceAndThrottle";
import {messageSuccess,confirm} from "@/action/MessagePrompt.js";
import {messageError} from "@/action/MessagePrompt.js";
import AddDataDialog from './components/AddDataDialog.vue';
import SvgIcon from "@/components/svgIcon/index.vue";
import {hasPermi} from "@/action/PowerTools";
import { ElMessageBox, ElMessage } from 'element-plus';
import * as XLSX from 'xlsx';
import { userDataStore } from '@/store/user';

export default defineComponent({
    components: {
        DictTags,
        AddDataDialog,
        SvgIcon,
    },
    setup() {
        const userStore = userDataStore(); // ✅ 正确调用 defineStore 实例化

        // 使用 computed 监听 token 的变化
        const token = computed(() => userStore.userInfo.token);
        const AddDataDialogRef = ref(null);  
        const router = useRouter();
        const dataContainer = reactive({
            loading:false,
            showSearch:true,
            checkinList:[],
            form: {
                name: '',
                status: '启用',  // 默认启用
            },
            params: {
                //基础参数
                pageNum: 1,
                pageSize: 10,
            },
            config: {
                total: 0,
            },
            selectedIds:[],
            currDataList:[],
            userRole: computed(() => {
                return token.value === 'adminToken' ? 'admin' : 'staff';
            }),
        });

        /** 获取用户数据列表 */
        const getDataList = debounceFn(async () => {
            dataContainer.loading = true;
            try {
                const response = await axios.get('http://localhost:8080/user/queryUsers', {
                    params: {
                        keyword: dataContainer.form.keyword || ''  // 模糊搜索关键词（如姓名或身份证）
                    }
                });
                if (response.data.isOk) {
                    const allList = response.data.data || [];
                    dataContainer.checkinList = allList;
                    dataContainer.config.total = response.data.count || allList.length;

                    // 本地分页（如果后端以后支持分页可以移除这段）
                    const start = (dataContainer.params.pageNum - 1) * dataContainer.params.pageSize;
                    const end = start + dataContainer.params.pageSize;
                    dataContainer.currDataList = allList.slice(start, end);
                } else {
                    messageError(response.data.msg || '获取客户数据失败');
                }
            } catch (error) {
                messageError('网络请求失败，请检查连接');
            } finally {
                dataContainer.loading = false;
            }
        }, 300);

        getDataList();

        /** 处理分页 size 变化 */
        const handleSizeChange = (size) => {
            dataContainer.params.pageSize = size;
            dataContainer.params.pageNum = 1;
            getDataList();
        };

        /** 处理分页 current 变化 */
        const handleCurrentChange = (page) => {
            dataContainer.params.pageNum = page;
            getDataList();
        };

        /** 处理选择变化 */
        const handleSelectionChange = (selection) => {
            dataContainer.selectedIds = selection.map(item => item.id);
        };

        /** 双击单元格，复制单元格内容 */
        function copyToClipboard(text) {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }

        function handleCopyVale(_, __, ___, event) {
            const text = event.target.innerText;
            copyToClipboard(text);
            messageSuccess("复制成功，内容为：" + text);
        }

        /** 排序触发事件 */
        function handleSortChange(column, prop, order) {
            dataContainer.form.orderByColumn = column.prop;
            dataContainer.form.isAsc = column.order;
            getDataList();
        }

      const handleQuery = async () => {
        dataContainer.params.pageNum = 1; // 每次查询重置页码
        dataContainer.loading = true;

        try {
            const response = await axios.get('http://localhost:8080/user/queryUsers', {
                params: {
                    keyword: dataContainer.form.realName || ''  // 使用 realName 字段
                }
            });

            if (response.data.isOk) {
                const allList = response.data.data || [];
                dataContainer.checkinList = allList;
                dataContainer.config.total = response.data.count || allList.length;

                // 本地分页（如果后端以后支持分页可以移除这段）
                const start = (dataContainer.params.pageNum - 1) * dataContainer.params.pageSize;
                const end = start + dataContainer.params.pageSize;
                dataContainer.currDataList = allList.slice(start, end);
            } else {
                messageError(response.data.msg || '获取客户数据失败');
            }
        } catch (error) {
            messageError('网络请求失败，请检查连接');
        } finally {
            dataContainer.loading = false;
        }
    };


        /** 重置按钮操作 */
        function resetQuery() {
            dataContainer.form = {
                realName: '',  // 修改为 realName
                roleName: '',  // 修改为 roleName
            };
            getDataList();
        }

        /** 导出数据 */
        /** 导出护理项目数据 */
        function handleExport() {
            const data = dataContainer.checkinList.map(item => ({
                编号: item.code,
                名称: item.name,
                价格: item.price,
                执行周期: item.cycle,
                执行次数: item.times,
                描述: item.description,
                状态: item.status,
            }));

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '护理项目列表');
            XLSX.writeFile(workbook, '护理项目列表.xlsx');
            }

        /** 新增按钮操作 */
        function handleAdd() {
            if (!AddDataDialogRef.value) return;
            AddDataDialogRef.value.resetData();
            AddDataDialogRef.value.initData(true, {}, {
                afterTitle: ' - 新增护理项目', 
                isShow: false
            }).then(() => {
                getDataList();
            }).catch((closeType) => {
                console.log(`Dialog closed with ${closeType}`);
            });
        }

        /** 详情按钮操作 */
        function handleDetails(row, querys = {}) {
            if (!AddDataDialogRef.value) return;
            AddDataDialogRef.value.resetData();
            AddDataDialogRef.value.initData(true, {
                ...row,
            }, {
                ...querys,
                isShow: true, // ✅ 传入只读标志
                afterTitle: ' - 查看详情'
            }).then(() => {
                // 查看详情不需要刷新列表
            }).catch(() => {
                // 用户关闭弹窗
            });
        }


        /** 修改按钮操作 */
        function handleEdit(row, querys) {
            if (!AddDataDialogRef.value) return;
            AddDataDialogRef.value.resetData();
            AddDataDialogRef.value.initData(true, {
                ...row,
            }, {
                ...querys,
                afterTitle: ' - 修改项目详情', 
            }).then(updatedRecord => {
                // 更新成功后，刷新列表
                getDataList();
            }).catch(() => {
                // 用户取消编辑
            });
        }

        /** 删除用户 */
        const handleDelete = async (id) => {
        try {
            await ElMessageBox.confirm(
            '确定要删除该用户吗？删除后将无法恢复！',
            '删除确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
            );

            const response = await axios.delete(`http://localhost:8080/user/deleteUser/${id}`);

            if (response.data.isOk) {
            ElMessage.success('用户删除成功');
            getDataList(); // 重新加载列表
            } else {
            ElMessage.error(response.data.msg || '用户删除失败');
            }
        } catch (error) {
            if (error !== 'cancel') {
            ElMessage.error('请求出错或操作取消');
            }
        }
        };



        /** 批量删除 */
        const handleBatchDelete = () => {
            if (dataContainer.selectedIds.length === 0) {
                ElMessage.warning('请选择要删除的记录');
                return;
            }
            handleDelete(dataContainer.selectedIds);
        };

        return {
            dataContainer,
            getDataList,
            handleCopyVale,
            copyToClipboard,
            handleSortChange,
            handleQuery,
            resetQuery,
            handleExport,
            handleAdd,
            handleDetails,
            handleEdit,
            handleDelete,
            handleBatchDelete,
            handleSelectionChange,
            AddDataDialogRef,
            hasPermi,
            handleSizeChange,
            handleCurrentChange,
        };
    },
});
</script>

<style lang="scss" scoped>
.main-view {
    display: flex;
    flex-direction: column;
    > .page-query-box {
        margin: 0 0 10px 0 !important;
        padding: 10px 10px 0px 10px;
        :deep(.el-form-item) {
            margin-bottom: 10px !important;
        }
        :deep(.el-form-item--default) {
            width: 100%;
            margin-right: 0;
        }
    }
    > .content-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 10px 10px;
        box-sizing: border-box;
        background: #fff;
        > .top-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0px 0 10px 0;
        }
        > .table-container {
            flex: 1 1 auto;
            height: 0;
            overflow: auto;
        }
    }
    .pagination-container {
        display: flex;
        justify-content: flex-end;
        padding: 0;
        margin: 10px 0 0 0;
    }
}
</style>
