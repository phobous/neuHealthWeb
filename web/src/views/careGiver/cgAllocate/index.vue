<template>
  <div class="page-container main-view">
    <div class="table-box content-container page-content-box">
      <div class="top-container">
        <div class="left">
          <el-input
              v-model="searchName"
              placeholder="请输入管家姓名"
              clearable
              @input="startQuery"
              style="width: 200px;"
          ></el-input>
          <el-button
              type="primary"
              @click="startQuery"
              style="margin-left: 10px;"
          >
            查找
          </el-button>
        </div>
      </div>

      <div class="table-container">
        <el-table
            v-loading="dataContainer.loading"
            :data="dataContainer.currDataList"
            border
            @row-click="handleRowClick"
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
              label="姓名"
              show-overflow-tooltip
              align="center"
              min-width="120"
              prop="name"
          />
          <el-table-column
              label="性别"
              show-overflow-tooltip
              align="center"
              min-width="90"
              prop="gender"
          />
          <el-table-column
              label="电话"
              show-overflow-tooltip
              align="center"
              min-width="150"
              prop="phone"
          />
          <el-table-column
              label="邮箱"
              show-overflow-tooltip
              align="center"
              min-width="200"
              prop="email"
          />
          <el-table-column
              label="状态"
              show-overflow-tooltip
              align="center"
              min-width="100"
              prop="status"
          >
            <template #default="scope">
              <el-tag
                  :type="scope.row.status === '启用' ? 'success' : 'danger'"
              >
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
              label="操作"
              width="150"
              fixed="right"
              class-name="small-padding fixed-width"
          >
            <template #default="scope">
              <el-button
                  type="primary"
                  @click="handleDeploy(scope.row)"
              >查看客户</el-button>
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
import { defineComponent, reactive, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const router = useRouter();  // 使用 Vue Router
    const searchName = ref(''); // Search input for caregiver name
    const dataContainer = reactive({
      loading: false,
      caregiversList: [],
      params: {
        pageNum: 1,
        pageSize: 10,
        name: '', // Search parameter
      },
      config: {
        total: 0,
      },
      currDataList: [],
    });

    // Fetch caregiver data based on search input and pagination
    const getCaregiversList = async () => {
      dataContainer.loading = true;
      try {
        const response = await axios.get('http://localhost:8080/caregiver/search', {
          params: {
            name: dataContainer.params.name, // Pass search parameter
            pageNum: dataContainer.params.pageNum,
            pageSize: dataContainer.params.pageSize,
          },
        });

        if (response.data.isOk) {
          dataContainer.caregiversList = response.data.data;
          console.log(response.data.data);  // 打印返回的 caregivers 数据
          dataContainer.config.total = response.data.count; // Total number of caregivers
          const start = (dataContainer.params.pageNum - 1) * dataContainer.params.pageSize;
          const end = start + dataContainer.params.pageSize;
          dataContainer.currDataList = dataContainer.caregiversList.slice(start, end);
        } else {
          ElMessage.error(response.data.msg || '获取数据失败');
        }
      } catch (error) {
        ElMessage.error('网络请求失败，请检查连接');
      } finally {
        dataContainer.loading = false;
      }
    };


    // Trigger search query
    const startQuery = () => {
      dataContainer.params.pageNum = 1;
      dataContainer.params.name = searchName.value;
      getCaregiversList();
    };

    // Handle row click, navigate to the customer page
    const handleDeploy = (row) => {
      // 跳转到客户管理界面，并传递 caregiverId 参数
      router.push({
        name: 'manage-client',  // 使用子路由的name来跳转
        query: {
          caregiverId: row.userId,  // 传递 caregiverId 参数
        },
      });
    };



    // Handle pagination size change
    const handleSizeChange = (size) => {
      dataContainer.params.pageSize = size;
      dataContainer.params.pageNum = 1;
      getCaregiversList();
    };

    // Handle pagination page change
    const handleCurrentChange = (page) => {
      dataContainer.params.pageNum = page;
      getCaregiversList();
    };

    // Initialize the caregivers list
    getCaregiversList();

    return {
      searchName,
      dataContainer,
      startQuery,
      handleSizeChange,
      handleCurrentChange,
      handleDeploy,  // 确保这里返回 handleDeploy 方法
    };
  },
});
</script>
<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-query-box {
  margin: 0 0 10px 0 !important;
  padding: 10px 10px 0 10px;
  background: #f5f7fa;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  :deep(.el-form-item) {
    margin-bottom: 10px !important;
  }
  :deep(.el-form-item--default) {
    width: 100%;
    margin-right: 0;
  }
  .el-form {
    width: 100%;
  }
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.page-content-box {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.top-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  .left {
    display: flex;
    gap: 10px;
  }
  .right {
    display: flex;
    gap: 10px;
  }
}

.table-box {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.el-table {
  flex: 1;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}
</style>