<template>
    <div class="page-container main-view">
  
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
                        type="primary"
                        @click="startQuery">
                        <SvgIcon 
                            :style="'width:15px;height:15px;margin-right:5px;'"
                            name="svg:start.svg"></SvgIcon>
                        启用
                    </el-button>
                    <el-button
                        @click="prohibitQuery">
                        <SvgIcon 
                            :style="'width:15px;height:15px;margin-right:10px;'"
                            name="svg:prohibit.svg"></SvgIcon>
                        停用
                    </el-button>
                    <el-button
                        @click="resetQuery">
                        <SvgIcon 
                            :style="'width:15px;height:15px;margin-right:10px;'"
                            name="svg:redo.svg"></SvgIcon>
                        重置
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
                        label="护理级别"
                        show-overflow-tooltip
                        align="center"
                        min-width="90"
                        prop="name"/>
                    <el-table-column
                        label="状态"
                        show-overflow-tooltip
                        align="center"
                        min-width="90"
                        prop="status">
                        <template #default="scope">
                            <el-tag 
                                :type="scope.row.status === '在住' ? 'success' : 
                                       scope.row.status === '已退房' ? 'info' : 'warning'">
                                {{ scope.row.status }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                        label="操作"
                        width="300"
                        fixed="right"
                        class-name="small-padding fixed-width">
                        <template #default="scope">
                            <el-button
                                class="btn-green-text"
                                :text="true"
                                @click="handleDeploy(scope.row,{
                                    isShow:true,
                                    afterTitle:' - 查看详情',
                                })">
                                护理项目配置
                            </el-button>
                            <el-button
                                type="primary"  
                                :text="true"
                                @click="handleEdit(scope.row,{
                                    isShow:false,
                                    afterTitle:' - 编辑',
                                })">
                                编辑
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
        <EditDataDialog
            ref="EditDataDialogRef"></EditDataDialog>
        <addDataDialog
            ref="addDataDialogRef"></addDataDialog>
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
import EditDataDialog from "./components/EditDataDialog.vue";
import addDataDialog from "./components/addDataDialog.vue";
import SvgIcon from "@/components/svgIcon/index.vue";
import {hasPermi} from "@/action/PowerTools";
import { ElMessageBox, ElMessage } from 'element-plus';
import * as XLSX from 'xlsx';
import { userDataStore } from '@/store/user';

export default defineComponent({
    components: {
        DictTags,
        EditDataDialog,
        addDataDialog,
        SvgIcon,
    },
    setup() {
        const userStore = userDataStore(); // ✅ 正确调用 defineStore 实例化

        // 使用 computed 监听 token 的变化
        const token = computed(() => userStore.userInfo.token);
        const EditDataDialogRef = ref(null);  //组件实例
        const addDataDialogRef = ref(null);  //组件实例
        const router = useRouter();
        const dataContainer = reactive({
            loading:false,
            showSearch:true,
            checkinList:[],
            care_levels:[],
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
        const getDataList = debounceFn(async () => {
            dataContainer.loading = true;
            try {
                const response = await axios.get('http://localhost:8080/careLevel/listAll');
                
                if (response.data.isOk) {
                    // 存储完整的入住登记列表
                    dataContainer.care_levels = response.data.care_levels;
                    dataContainer.config.total = response.data.care_levels.length;

                    // 计算当前页的开始和结束索引
                    const start = (dataContainer.params.pageNum - 1) * dataContainer.params.pageSize;
                    const end = start + dataContainer.params.pageSize;

                    // 获取当前页的数据
                    dataContainer.currDataList = dataContainer.care_levels.slice(start, end);
                } else {
                    console.error('请求入住登记列表失败', response.data.msg);
                    messageError(response.data.msg || '获取数据失败');
                }
            } catch (error) {
                console.error('请求入住登记列表失败', error);
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

       const startQuery = async () => {
        dataContainer.params.pageNum = 1;
        try {
            const response = await axios.get('http://localhost:8080/careLevel/list', {
            params: {
                status: '启用',          // 传给后端的状态参数
                pageNum: dataContainer.params.pageNum,
                pageSize: dataContainer.params.pageSize
            }
            });

            if (response.data.isOk) {
            // 后端返回的列表在 response.data.data
            const levels = response.data.data || [];

            dataContainer.checkinList = levels;
            dataContainer.config.total = levels.length;  // 你这里没有分页逻辑，可以用总长度代替

            const start = (dataContainer.params.pageNum - 1) * dataContainer.params.pageSize;
            const end = start + dataContainer.params.pageSize;
            dataContainer.currDataList = levels.slice(start, end);
            } else {
            ElMessageBox.alert('未找到相关护理级别', '提示', {
                confirmButtonText: '确定',
            });
            }
        } catch (error) {
            ElMessageBox.alert('搜索失败，请重试', '提示', {
            confirmButtonText: '确定',
            });
        }
        };

       const prohibitQuery = async () => {
        dataContainer.params.pageNum = 1;
        try {
            const response = await axios.get('http://localhost:8080/careLevel/list', {
            params: {
                status: '停用',          // 传给后端的状态参数
                pageNum: dataContainer.params.pageNum,
                pageSize: dataContainer.params.pageSize
            }
            });

            if (response.data.isOk) {
            // 后端返回的列表在 response.data.data
            const levels = response.data.data || [];

            dataContainer.checkinList = levels;
            dataContainer.config.total = levels.length;  

            const start = (dataContainer.params.pageNum - 1) * dataContainer.params.pageSize;
            const end = start + dataContainer.params.pageSize;
            dataContainer.currDataList = levels.slice(start, end);
            } else {
            ElMessageBox.alert('未找到相关护理级别', '提示', {
                confirmButtonText: '确定',
            });
            }
        } catch (error) {
            ElMessageBox.alert('搜索失败，请重试', '提示', {
            confirmButtonText: '确定',
            });
        }
        };
        /** 重置按钮操作 */
        function resetQuery() {
            getDataList();
            
        }

        /** 新增按钮操作 */
        function handleAdd() {
            if (!addDataDialogRef.value) return;
            addDataDialogRef.value.resetData();
            addDataDialogRef.value.initData(true, {}, {
                afterTitle: ' - 新增级别', 
                isShow: false
            }).then(() => {
                getDataList();
            }).catch((closeType) => {
                console.log(`Dialog closed with ${closeType}`);
            });
        }

        /** 配置按钮操作 */
        function handleDeploy(row) {
            router.push({
                path: 'care-level-Item',
                query: {
                levelId: row.id,
                levelName: row.name
                }
            });
         }


        /** 编辑按钮操作 */
       function handleEdit(row, querys) {
        if (!EditDataDialogRef.value) return;

        EditDataDialogRef.value.initData(
            true,
            {          // 这是表单数据，要填充的字段，如级别名称和状态
            id: row.id,
            name: row.name,
            status: row.status
            },
            {          // 这是配置项，控制对话框标题等
            afterTitle: ' - 编辑',
            isShow: false,
            ...querys,  // 如果querys里有其它配置，也可以合并
            }
        ).then(updatedRecord => {
            getDataList();
            ElMessage.success('更新成功');
        }).catch(() => {
            // 用户取消编辑
        });
        }


      const handleDelete = async (id) => {
        try {
            await ElMessageBox.confirm(
            '确定要删除选中的护理级别吗？',
            '删除确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
            );

            const response = await axios.delete(`http://localhost:8080/careLevel/delete/${id}`);

            if (response.data.isOk) {
            ElMessage.success('删除成功');
            getDataList();
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
            startQuery,
            prohibitQuery,
            resetQuery,
            handleAdd,
            handleDeploy,
            handleEdit,
            handleDelete,
            handleBatchDelete,
            handleSelectionChange,
            EditDataDialogRef,
            addDataDialogRef,
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
    .btn-green-text {
  color: #52c41a; /* 更柔和的绿色 */
}
}
</style>
