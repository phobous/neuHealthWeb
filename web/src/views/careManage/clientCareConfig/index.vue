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
                            <el-form-item label="客户姓名" prop="name">
                                <el-input
                                    v-model="dataContainer.form.name"
                                    placeholder="请输入客户名称"
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
                                    刷新
                                </el-button>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </el-col>
        </el-row>
        <div class="table-box content-container page-content-box">

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
                        prop="clientId"/>
                    <el-table-column
                        label="客户姓名"
                        show-overflow-tooltip
                        align="center"
                        min-width="90"
                        prop="name"/>
                    <el-table-column
                        label="年龄"
                        show-overflow-tooltip
                        align="center"
                        min-width="60"
                        prop="age"/>
                    <el-table-column
                        label="性别"
                        show-overflow-tooltip
                        align="center"
                        min-width="60"
                        prop="gender"/>
                    <el-table-column
                        label="房间号"
                        show-overflow-tooltip
                        align="center"
                        min-width="90"
                        prop="roomNumber"/>
                    <el-table-column
                        label="床号"
                        show-overflow-tooltip
                        align="center"
                        min-width="60"
                        prop="bedNumber"/>
                     <el-table-column
                        label="所属楼房"
                        show-overflow-tooltip
                        align="center"
                        min-width="150"
                        prop="building"/>
                     <el-table-column
                        label="联系电话"
                        show-overflow-tooltip
                        align="center"
                        min-width="150"
                        prop="phone"/>
                    、<el-table-column
                        label="护理级别"
                        show-overflow-tooltip
                        align="center"
                        min-width="150"
                        prop="careLevel"/>
                    <!-- 操作栏 -->
                        <el-table-column label="操作" width="250" fixed="right" class-name="small-padding fixed-width">
                            <template #default="scope">
                                <!-- 如果有护理级别，显示移除护理级别按钮 -->
                                <el-button
                                    v-if="scope.row.careLevel"
                                    :text="true"
                                    type="danger"
                                    @click="removeCareLevel(scope.row)">
                                    移除护理级别
                                </el-button>
                                <!-- 如果没有护理级别，显示设置护理级别按钮 -->
                                <el-button
                                    v-else
                                    :text="true"
                                    type="primary"
                                    @click="setCareLevel(scope.row)">
                                    设置护理级别
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

        <CareLevelDialog
            ref="CareLevelDialogRef"></CareLevelDialog>
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
import SvgIcon from "@/components/svgIcon/index.vue";
import {hasPermi} from "@/action/PowerTools";
import { ElMessageBox, ElMessage } from 'element-plus';
import * as XLSX from 'xlsx';
import { userDataStore } from '@/store/user';
import CareLevelDialog from './components/CareLevelDialog.vue';


export default defineComponent({
    components: {
        DictTags,
        CareLevelDialog,
        SvgIcon,
    },
    setup() {
        const userStore = userDataStore(); // ✅ 正确调用 defineStore 实例化

        // 使用 computed 监听 token 的变化
        const token = computed(() => userStore.userInfo.token);
        const router = useRouter();
        const CareLevelDialogRef = ref(null);
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

        /** 获取数据列表 */
         const getDataList = async () => {
            dataContainer.loading = true;
            try {
                const response = await axios.get('http://localhost:8080/clientCare/listAllClients', {
                    params: {
                        pageNum: dataContainer.params.pageNum,
                        pageSize: dataContainer.params.pageSize,
                        name: dataContainer.form.name,
                        status: dataContainer.form.status,
                    }
                });
                if (response.data.isOk) {
                    const items = response.data.data || [];
                    dataContainer.checkinList = items;
                    dataContainer.config.total = items.length;

                    // 前端分页，手动切片
                    const start = (dataContainer.params.pageNum - 1) * dataContainer.params.pageSize;
                    const end = start + dataContainer.params.pageSize;
                    dataContainer.currDataList = items.slice(start, end);
                } else {
                    ElMessage.error(response.data.msg || '查询失败');
                }
            } catch (error) {
                ElMessage.error('网络请求失败，请检查连接');
            } finally {
                dataContainer.loading = false;
            }
        };

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

     /** 搜索按钮操作 */
        const handleQuery = async () => {
            dataContainer.params.pageNum = 1; // 每次查询重置页码
            dataContainer.loading = true;

            try {
                const response = await axios.get('http://localhost:8080/clientCare/listClientsByName', {
                    params: {
                        name: dataContainer.form.name, // 客户姓名模糊查询
                    }
                });

                if (response.data.isOk) {
                    const clients = response.data.data || []; // 从返回的数据中提取客户信息
                    dataContainer.checkinList = clients;
                    dataContainer.config.total = clients.length;

                    // 前端分页，手动切片
                    const start = (dataContainer.params.pageNum - 1) * dataContainer.params.pageSize;
                    const end = start + dataContainer.params.pageSize;
                    dataContainer.currDataList = clients.slice(start, end);
                } else {
                    dataContainer.checkinList = [];
                    dataContainer.currDataList = [];
                    dataContainer.config.total = 0;
                    ElMessage.error(response.data.msg || '查询失败');
                }
            } catch (error) {
                dataContainer.checkinList = [];
                dataContainer.currDataList = [];
                dataContainer.config.total = 0;
                ElMessage.error('网络请求失败，请检查连接');
            } finally {
                dataContainer.loading = false;
            }
        };


       /** 配置按钮操作 */
        function setCareLevel(row) {
        if (CareLevelDialogRef.value) {
            CareLevelDialogRef.value.open(row)
        }
        }



       const removeCareLevel = async (row) => {
            try {
                // 弹出确认框，确认是否移除
                console.log("客户ID: ", row.clientId);  // 调试日志，确认 clientId
                console.log("护理级别ID: ", row.careLevelId);  // 调试日志，确认 careLevelId

                await ElMessageBox.confirm(
                    `确定要移除客户 ${row.name} 的护理级别吗？`,
                    '移除护理级别',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                    }
                );

                // 发送 POST 请求，传递 clientId 和 careLevelId，使用查询参数
                const response = await axios.post('http://localhost:8080/clientCare/remove', null, {
                    params: {
                        clientId: row.clientId,  // 客户ID
                        careLevelId: row.careLevelId,  // 护理级别ID
                    }
                });

                if (response.data.isOk) {
                    // 操作成功，提示成功消息并刷新数据
                    ElMessage.success('护理级别移除成功');
                    getDataList();
                } else {
                    // 操作失败，提示失败消息
                    ElMessage.error(response.data.msg || '移除失败');
                }
            } catch (error) {
                // 请求发生错误时，提示错误信息
                ElMessage.error('移除护理级别失败');
            }
        };


        /** 重置按钮操作 */
        function resetQuery() {
            dataContainer.form = {
                name: '',
                bedInfo: ''
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


    
            /** 删除 */
            const handleDelete = async (id) => {
            try {
                await ElMessageBox.confirm(
                '确定要删除选中的护理项目吗？',
                '删除确认',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
                );

                const response = await axios.delete(`http://localhost:8080/careItem/delete/${id}`);

                if (response.data.isOk) {
                ElMessage.success('删除成功');
                getDataList(); // 重新加载数据
                } else {
                ElMessage.error(response.data.msg || '删除失败');
                }
            } catch (error) {
                if (error !== 'cancel') {
                ElMessage.error('删除操作失败');
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
            handleDelete,
            handleBatchDelete,
            handleSelectionChange,
            CareLevelDialogRef,
            hasPermi,
            handleSizeChange,
            handleCurrentChange,
            removeCareLevel,
            setCareLevel
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
