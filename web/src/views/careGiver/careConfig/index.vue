<template>
  <div class="page-container main-view">
    <div class="table-box content-container page-content-box">
      <div class="top-container">
        <div class="left">
          <el-input
              v-model="searchName"
              placeholder="请输入客户姓名"
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
              label="客户姓名"
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
              label="年龄"
              show-overflow-tooltip
              align="center"
              min-width="90"
              prop="age"
          />
          <el-table-column
              label="床号"
              show-overflow-tooltip
              align="center"
              min-width="90"
              prop="bedId"
          />
          <el-table-column
              label="操作"
              width="150"
              fixed="right"
              class-name="small-padding fixed-width"
          >
            <template #default="scope">
              <el-button
                  type="primary"
                  @click="handleViewProjects(scope.row)"
              >查看项目</el-button>
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
import { defineComponent, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const router = useRouter();  // 使用 Vue Router
    const searchName = ref(''); // 搜索框：客户姓名
    const dataContainer = reactive({
      loading: false,
      clientsList: [],
      params: {
        pageNum: 1,
        pageSize: 10,
        name: '', // 搜索参数
      },
      config: {
        total: 0,
      },
      currDataList: [],
    });

    // 获取客户数据（基于姓名和分页）
    const getClientsList = async () => {
      dataContainer.loading = true;
      try {
        const response = await axios.get('http://localhost:8080/clients', {
          params: {
            name: dataContainer.params.name, // 传递搜索参数
            type: '',
            pageNum: dataContainer.params.pageNum,
            pageSize: dataContainer.params.pageSize,
          },
        });

        if (response.data.isOk) {
          dataContainer.clientsList = response.data.client;
          dataContainer.config.total = response.data.client.length; // 客户总数
          const start = (dataContainer.params.pageNum - 1) * dataContainer.params.pageSize;
          const end = start + dataContainer.params.pageSize;
          dataContainer.currDataList = dataContainer.clientsList.slice(start, end);
          console.log(response.data.client);
        } else {
          ElMessage.error(response.data.msg || '获取数据失败');
        }
      } catch (error) {
        ElMessage.error('网络请求失败，请检查连接');
      } finally {
        dataContainer.loading = false;
      }
    };

    // 启动查询
    const startQuery = () => {
      dataContainer.params.pageNum = 1;
      dataContainer.params.name = searchName.value;
      getClientsList();
    };

    // 处理“查看项目”按钮点击，跳转到项目页面
    const handleViewProjects = (row) => {
      // 跳转到项目管理页面，并传递 clientId 参数
      router.push({
        name: 'care-config',  // 使用项目页面的name来跳转
        query: {
          clientId: row.id,  // 传递 clientId 参数
        },
      });
    };

    // 处理分页大小变化
    const handleSizeChange = (size) => {
      dataContainer.params.pageSize = size;
      dataContainer.params.pageNum = 1;
      getClientsList();
    };

    // 处理分页页码变化
    const handleCurrentChange = (page) => {
      dataContainer.params.pageNum = page;
      getClientsList();
    };

    // 初始化客户列表
    getClientsList();

    return {
      searchName,
      dataContainer,
      startQuery,
      handleSizeChange,
      handleCurrentChange,
      handleViewProjects,  // 确保这里返回 handleViewProjects 方法
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