<template>
  <div class="page-container main-view">
    <!-- 搜索区域 -->
    <el-row :gutter="0" v-show="dataContainer.showSearch" class="page-query-box">
      <el-col :span="24" :xs="24">
        <el-form :model="dataContainer.form" ref="QueryFormRef" :inline="true" label-width="110px">
          <el-row :gutter="0">
            <el-col :span="6" :xs="6">
              <el-form-item label="姓名" prop="name">
                <el-input
                  v-model="dataContainer.form.name"
                  placeholder="请输入姓名"
                  clearable
                  @clear="handleQuery"
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="6">
              <el-form-item label="入住日期" prop="checkinDate">
                <el-date-picker
                  v-model="dataContainer.form.checkinDate"
                  placeholder="请选择日期"
                  clearable
                  @clear="handleQuery"
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6" :xs="6" class="query-buttons">
              <el-form-item label=" ">
                <el-button type="primary" @click="handleQuery">
                  <SvgIcon 
                    :style="'width:15px;height:15px;margin-right:5px;'"
                    name="svg:search-bt.svg"></SvgIcon>
                  查询
                </el-button>
                <el-button @click="resetQuery">
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

    <!-- 主体内容区域 -->
    <div class="table-box content-container page-content-box">
      <!-- 标签切换（正在使用 / 使用历史） -->
      <div class="top-container">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="正在使用" name="正在使用"></el-tab-pane>
          <el-tab-pane label="使用历史" name="使用历史"></el-tab-pane>
        </el-tabs>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <el-table
          v-loading="dataContainer.loading"
          :data="dataContainer.currDataList "
          border
          @cell-dblclick="handleCopyVale"
          height="100%"
        >
          <el-table-column
            label="序号"
            show-overflow-tooltip
            align="center"
            min-width="60"
            prop="id"
          />
          <el-table-column
            label="客户姓名"
            show-overflow-tooltip
            align="center"
            min-width="110"
            prop="clientName"
          />
          <el-table-column
            label="性别"
            show-overflow-tooltip
            align="center"
            min-width="80"
            prop="clientGender"
          >
            <!-- <template #default="scope">
              <el-tag :type="scope.row.gender === '男' ? 'primary' : 'danger'">
                {{ scope.row.gender }}
              </el-tag>
            </template> -->
          </el-table-column>
          <!-- <el-table-column
            label="床位详情"
            show-overflow-tooltip
            align="center"
            min-width="120"
            prop="bedNumber"
          /> -->
          <el-table-column
              label="床位详情"
              show-overflow-tooltip
              align="center"
              min-width="120"
            >
              <template #default="scope">
                606#{{ scope.row.bedNumber }}
              </template>
            </el-table-column>
          <el-table-column
            label="床位使用起始时间"
            show-overflow-tooltip
            align="center"
            min-width="150"
            prop="checkInDate"
          />
          <el-table-column
            label="床位使用结束时间"
            show-overflow-tooltip
            align="center"
            min-width="150"
            prop="checkOutDate"
          />
          <el-table-column
          align="center"
            label="操作"
            width="200"
            v-if="activeTab === '正在使用'"
            fixed="right"
            class-name="small-padding fixed-width"
          >
            <template #default="scope">
              <!-- 修改按钮 -->
              <el-button
                :text="true"
                v-if="activeTab === '正在使用'"
                @click="handleEdit(scope.row)"
              >
                修改
              </el-button>
              <!-- 床位调换按钮（仅“正在使用” tab 显示） -->
              <el-button
                :text="true"
                type="primary"
                v-if="activeTab === '正在使用'"
                @click="handleBedChange(scope.row)"
              >
                床位调换
              </el-button>
              
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页区域 -->
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

    <!-- 修改弹窗、床位调换弹窗（需自行实现组件逻辑） -->
    <EditDataDialog ref="EditDataDialogRef"
     @confirm="getDataList" ></EditDataDialog>
    <BedChangeDialog ref="BedChangeDialogRef"
    @confirm="getDataList" ></BedChangeDialog>
  </div>
</template>

<script>
import axios from 'axios';
import { defineComponent, reactive, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { copyValue } from '@/common/OtherTools';
import { messageSuccess, messageError, } from '@/action/messagePrompt.js';
import { hasPermi } from '@/action/PowerTools';
import * as XLSX from 'xlsx';
import { userDataStore } from '@/store/user';
import SvgIcon from '@/components/svgIcon/index.vue';
// 引入弹窗组件（需自行实现）
import EditDataDialog from './components/EditDataDialog.vue'; 
import BedChangeDialog from './components/BedChangeDialog.vue'; 
//import { ta } from 'element-plus/es/locale/index.js';

export default defineComponent({
  components: {
    SvgIcon,
    EditDataDialog,
    BedChangeDialog,
  },
  setup() {
    const lastActiveTab = ref(''); // 记录上一次激活的标签
    const isFirstClick = ref(true); // 标记首次点击（避免初始状态误判）
    const userStore = userDataStore();
    const token = computed(() => userStore.userInfo.token);
    const router = useRouter();
    const activeTab = ref('正在使用'); // 控制 tab 切换，默认“正在使用”

  
    const usageRecords =reactive ([
      {
        id:'',
        clientId: '',
        bedId: '',
        checkInDate: '',
        checkOutDate: '',
        clientName: '',
        clientGender: '',
        bedNumber: '',
        updatedAt: '',
        createdAt: '',
        status: '',
        isDeleted: '',

      }
    ]);

    const bedList = reactive([]);
 
    const dataContainer = reactive({
      loading: false,
      showSearch: true,
      originalDat:[],
      usageList: [], // 存储完整的入住登记列表
      
      form: {
        id:'',
        clientId: '',
        bedId: '',
        checkInDate: '',
        checkOutDate: '',
        clientName: '',
        clientGender: '',
        bedNumber: '',
        updatedAt: '',
        createdAt: '',
        status: '',
        isDeleted: '',

      },
      params: {
        pageNum: 1,
        pageSize: 10,
      },
      config: {
        total: 0,
      },
      currDataList: [], 
      userRole: computed(() => token.value === 'adminToken' ? 'admin' : 'staff'),
    });   

    // 获取数据列表（区分 tab）
    const getDataList = async () => {
  dataContainer.loading = true;
  try {
    // 添加请求配置，包括超时设置和认证头
    const response = await axios.get('http://localhost:8080/bedUsageRecord/list', {
      timeout: 10000, // 设置请求超时时间为10秒
      headers: {
        // 添加认证头，假设token存储在全局状态或localStorage中
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // 统一处理响应格式检查
    if (response.data.if) {
      // 明确指定变量作用域
                    console.log('获取数据成功:', response.data.usageRecords);
                    usageRecords.splice(0, usageRecords.length, ...response.data.usageRecords); 
                    console.log('获取数据成功前端:', usageRecords);
                    // 存储完整的入住登记列表
                    dataContainer.originalData = response.data.usageRecords
                    dataContainer.originalData= dataContainer.originalData.filter(item => item.status === activeTab.value);
                    // 初始时使用原始数据
                    dataContainer.usageList = response.data.usageRecords;
                    dataContainer.usageList= dataContainer.usageList.filter(item => item.status === activeTab.value);
                    dataContainer.config.total = response.data.total;
                    console.log(response.data.total, '获取数据总数');

                    // 计算当前页的开始和结束索引
                    const start = (dataContainer.params.pageNum - 1) * dataContainer.params.pageSize;
                    const end = start + dataContainer.params.pageSize;

                    // 获取当前页的数据
                    dataContainer.currDataList = dataContainer.usageList.slice(start, end);
                    // 查找所有 status 为 "正在使用" 的项
                   // dataContainer.currDataList= dataContainer.currDataList.filter(item => item.status === '正在使用');
                    //console.log('当前页数据:', dataContainer.currDataList.length, dataContainer.currDataList);
                    calculateCurrentPageData();
                   // messageSuccess('数据加载成功');
      //usageRecords.value = response.data.usageRecords;
      
    } else {
      throw new Error(response.data.msg || '服务器返回错误');
    }
  } catch (error) {
    // 增强错误处理，区分不同类型的错误
    if (axios.isCancel(error)) {
      console.log('请求被取消:', error.message);
      messageError('请求被取消');
    } else if (error.code === 'ECONNABORTED') {
      console.error('请求超时:', error.message);
      messageError('请求超时，请稍后重试');
    } else if (error.response) {
      // 服务器返回错误状态码
      console.error('服务器响应错误:', error.response.status, error.response.data);
      messageError(`服务器错误 ${error.response.status}`);
    } else if (error.request) {
      // 请求已发送，但没有收到响应
      console.error('没有收到服务器响应:', error.message);
      messageError('无法连接到服务器');
    } else {
      // 其他错误
      console.error('请求错误:', error.message);
      messageError(error.message || '发生未知错误');
    }
  } finally {
    // 确保loading状态总是被重置
    dataContainer.loading = false;
  }
};
    // const getDataList = async () => {
    //   dataContainer.loading = true;
    //   try {
    //     const response = await axios.get(`http://localhost:8080/bedUsageRecord/list`);
    //     if (response.data.isOk) {
    //       usageRecords=response.data.usageRecords;
    //     } else {
    //       console.error('请求失败', response.data.msg);
    //       messageError(response.data.msg || '获取数据失败');
    //     }
    //   } catch (error) {
    //     console.error('请求失败', error);
    //     messageError('网络请求失败，请检查连接');
    //   } 
    // };

    onMounted(() => {
      getDataList();
    });

    // tab 切换事件
    const handleTabChange = (tab) => {
      // 根据当前 tab 过滤数据
      activeTab.value = tab;
      getDataList();
    };

    // 分页 size 变化
    const handleSizeChange = (size) => {
      dataContainer.params.pageSize = size;
      dataContainer.params.pageNum = 1;
      getDataList();
    };

    // 分页 current 变化
    const handleCurrentChange = (page) => {
      dataContainer.params.pageNum = page;
      getDataList();
    };

    // 双击复制
    const handleCopyVale = (_, __, ___, event) => {
      const text = event.target.innerText;
      copyValue(text); 
      messageSuccess(`复制成功，内容为：${text}`);
    };

   // 执行搜索过滤（修改为基于原始数据进行过滤）
const performSearch = () => {
  const { name, checkinDate } = dataContainer.form;
  let filteredData = [...dataContainer.originalData]; // 从原始数据开始过滤
  
  // 姓名搜索
  if (name) {
    filteredData = filteredData.filter(item => 
      item.clientName && item.clientName.toLowerCase().includes(name.toLowerCase())
    );
  }
  
  // 入住日期搜索（优化版）
  if (checkinDate) {
    // 将搜索日期转换为日期对象（仅保留日期部分，时间设为0点）
    const searchDate = new Date(checkinDate);
    searchDate.setHours(0, 0, 0, 0);
    
    filteredData = filteredData.filter(item => {
      if (!item.checkInDate) return false;
      
      // 将数据中的日期转换为日期对象
      let dataDate;
      if (typeof item.checkInDate === 'string') {
        // 支持多种日期格式解析
        dataDate = new Date(item.checkInDate.replace(/-/g, '/'));
        dataDate.setHours(0, 0, 0, 0);
      } else if (item.checkInDate instanceof Date) {
        dataDate = new Date(item.checkInDate);
        dataDate.setHours(0, 0, 0, 0);
      } else {
        return false;
      }
      
      // 精确比较日期（不考虑时间部分）
      return searchDate.getTime() === dataDate.getTime();
    });
  }
  
  // 更新过滤后的数据和总条数
  dataContainer.usageList = filteredData;
  dataContainer.config.total = filteredData.length;
  
  // 如果当前页没有数据，回到第一页
  if ((dataContainer.params.pageNum - 1) * dataContainer.params.pageSize >= filteredData.length) {
    dataContainer.params.pageNum = 1;
  }
  
  // 重新计算当前页数据
  calculateCurrentPageData();
};
// 计算当前页显示的数据
const calculateCurrentPageData = () => {
  const start = (dataContainer.params.pageNum - 1) * dataContainer.params.pageSize;
  const end = start + dataContainer.params.pageSize;
  dataContainer.currDataList = dataContainer.usageList.slice(start, end);
};

// 搜索
const handleQuery = () => {
  dataContainer.params.pageNum = 1; // 重置到第一页
  performSearch(); // 执行搜索过滤
  messageSuccess('搜索成功');
};

// 重置搜索
const resetQuery = () => {
  dataContainer.form = {
    name: '',
    checkinDate: '',
  };
  // 重置后重新获取全部数据
  getDataList();
  messageSuccess('搜索条件已重置');
};

    // // 搜索
    // const handleQuery = () => {
    //   dataContainer.params.pageNum = 1;
    //   getDataList();
    // };

    // // 重置搜索
    // const resetQuery = () => {
    //   dataContainer.form = {
    //     name: '',
    //     checkinDate: '',
    //   };
    //   getDataList();
    // };

    // 编辑操作（唤起修改弹窗）
    const handleEdit = (row) => {
      if (!EditDataDialogRef.value) return;
      EditDataDialogRef.value.initData(row).then(() => {
        getDataList();
        //ElMessage.success('修改成功');
      }).catch(() => {
        // 取消编辑逻辑
      });
    };
    

    // 床位调换操作（唤起调换弹窗）
    const handleBedChange = (row) => {
      if (!BedChangeDialogRef.value) return;
      BedChangeDialogRef.value.initData(row).then(() => {
        getDataList();
        //ElMessage.success('床位调换成功');
      }).catch((err) => {
      console.log('弹窗初始化出错：', err);
    });
    };

    // 删除操作
    const handleDelete = async (ids) => {
      try {
        await ElMessageBox.confirm(
          '确定要删除选中的记录吗？',
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );
        const response = await axios.post('http://localhost:8080/bedUsageRecord/delete', { ids });
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

    const EditDataDialogRef = ref(null);
    const BedChangeDialogRef = ref(null);

    return {
      lastActiveTab,
      isFirstClick,
      usageRecords,
      dataContainer,
      activeTab,
      handleTabChange,
      getDataList,
      handleCopyVale,
      handleQuery,
      resetQuery,
      handleEdit,
      handleBedChange,
      handleDelete,
      handleSizeChange,
      handleCurrentChange,
      EditDataDialogRef,
      BedChangeDialogRef,
      hasPermi,
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