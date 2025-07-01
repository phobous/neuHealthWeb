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
                        <div class="top-return-btn" style="padding: 10px;">
                        <el-button type="primary" @click="goBack">
                            返回
                        </el-button>
                        </div>
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
                        align="center"
                        width="60">
                        <template #default="scope">
                            {{ (dataContainer.params.pageNum - 1) * dataContainer.params.pageSize + scope.$index + 1 }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        label="护理项目编号"
                        show-overflow-tooltip
                        align="center"
                        min-width="80"
                        prop="itemCode"/>
                    <el-table-column
                        label="护理项目名称"
                        show-overflow-tooltip
                        align="center"
                        min-width="100"
                        prop="itemName"/>
                    <el-table-column
                        label="护理数量"
                        show-overflow-tooltip
                        align="center"
                        min-width="60"
                        prop="careQuantity"/>
                    <el-table-column
                        label="护理内容"
                        show-overflow-tooltip
                        align="center"
                        min-width="100"
                        prop="careContent"/>
                    <el-table-column
                        label="护理人员"
                        show-overflow-tooltip
                        align="center"
                        min-width="60"
                        prop="caregiverName"/>
                     <el-table-column
                        label="护理人员手机"
                        show-overflow-tooltip
                        align="center"
                        min-width="90"
                        prop="caregiverPhone"/>
                     <el-table-column
                        label="护理时间"
                        show-overflow-tooltip
                        align="center"
                        min-width="150"
                        prop="careTime"/>
                    <!-- 操作栏 -->
                        <el-table-column label="操作" width="100" fixed="right" class-name="small-padding fixed-width">
                            <template #default="scope">
                                <el-button
                                    :text="true"
                                    type="primary"
                                    @click="handleDelete(scope.row)">
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
import { useRoute } from "vue-router";

export default defineComponent({
    components: {
        DictTags,
        SvgIcon,
    },
    setup() {
        const userStore = userDataStore(); // ✅ 正确调用 defineStore 实例化
        const route = useRoute();
        const clientIdFromQuery = route.query.clientId;

        // 使用 computed 监听 token 的变化
        const token = computed(() => userStore.userInfo.token);
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

        const getDataList = async (clientId = null) => {
            const queryClientId = clientId || dataContainer.form.clientId;
            if (!queryClientId) {
                ElMessage.warning("请提供有效的客户 ID");
                return;
            }

            console.log("clientId 是", queryClientId);
            dataContainer.loading = true;

            try {
                const response = await axios.get('http://localhost:8080/helpGiver/recordDetails', {
                    params: { clientId: queryClientId }
                });

                const res = response.data;

                if (res.success) {
                    const items = res.data || [];
                    dataContainer.checkinList = items;
                    dataContainer.config.total = items.length;

                    // 分页处理
                    const start = (dataContainer.params.pageNum - 1) * dataContainer.params.pageSize;
                    const end = start + dataContainer.params.pageSize;
                    dataContainer.currDataList = items.slice(start, end);
                } else {
                    ElMessage.error(res.message || '查询失败');
                    dataContainer.checkinList = [];
                    dataContainer.currDataList = [];
                    dataContainer.config.total = 0;
                }
            } catch (error) {
                console.error("网络请求错误：", error);
                ElMessage.error('网络请求失败，请检查连接');
                dataContainer.checkinList = [];
                dataContainer.currDataList = [];
                dataContainer.config.total = 0;
            } finally {
                dataContainer.loading = false;
            }
        };



        if (clientIdFromQuery) {
            getDataList(clientIdFromQuery);
            } else {
            getDataList();
            }

        //按钮颜色映射
        function getTagType(status) {
        switch(status) {
            case '过期':
            case '欠费':
            return 'danger';  // 红色
            case '即将到期':
            return 'warning'; // 橙色
            case '正常':
            return 'success'; // 绿色
            default:
            return 'info';    // 默认蓝色
        }
        }
        // 返回上一页函数
            function goBack() {
            router.back();
            // 或者 window.history.back();
            }
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


    
          const handleDelete = async (row) => {
            console.log('要删除的行数据', row);   // 检查这里是否有id
            try {
                await ElMessageBox.confirm(
                    '确定要删除选中的护理记录吗？',
                    '删除确认',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                    }
                );

                const response = await axios.delete(`http://localhost:8080/helpGiver/deleteRecord/${row.id}`);

                if (response.data.isOk) {
                    ElMessage.success('删除成功');
                    getDataList(clientIdFromQuery || dataContainer.form.clientId); // 重新加载数据
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
            hasPermi,
            handleSizeChange,
            handleCurrentChange,
            getTagType,
            goBack
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
