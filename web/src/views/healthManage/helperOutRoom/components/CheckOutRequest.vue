<template>
  <div class="page-container main-view">
    <el-row
      :gutter="0"
      v-show="dataContainer.showSearch"
      class="page-query-box"
    >
      <el-col :span="24" :xs="24">
        <el-form
          :model="dataContainer.form"
          ref="QueryFormRef"
          :inline="true"
          label-width="110px"
        >
          <el-row :gutter="0">
            <div class="top-return-btn" style="padding: 10px;">
              <el-button type="primary" @click="handleAdd">
                添加退住申请
              </el-button>
              <el-button type="primary" @click="goBack">
                返回
              </el-button>
              <el-button @click="refreshList">刷新</el-button>
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
          height="100%"
          @sort-change="handleSortChange"
          @selection-change="handleSelectionChange"
          @cell-dblclick="handleCopyVale"
        >
        <el-table-column
          label="序号"
          prop="id"
          align="center"
          min-width="60"
        />
        <el-table-column
          label="客户姓名"
          prop="clientName"
          align="center"
          min-width="100"
        />
        <el-table-column
          label="入住时间"
          prop="checkInDate"
          align="center"
          min-width="160"
        />
        <el-table-column
          label="退住时间"
          prop="checkOutDate"
          align="center"
          min-width="160"
        />
        <el-table-column
          label="退住类型"
          prop="type"
          align="center"
          min-width="120"
        />
        <el-table-column
          label="退住原因"
          prop="reason"
          align="center"
          min-width="160"
        />
        <el-table-column
          label="审批时间"
          prop="reviewTime"
          align="center"
          min-width="160"
        />
        <el-table-column
          label="床位号"
          prop="bedNo"
          align="center"
          min-width="100"
        />
         <el-table-column
          label="审批状态"
          prop="status"
          align="center"
          min-width="100"
        >
          <template #default="scope">
            <el-tag
              :type="getTagType(scope.row.status)"
              effect="dark"
              style="width: 80px; text-align: center"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
          <!-- 操作列 -->
          <el-table-column
            label="操作"
            align="center"
            fixed="right"
            width="160"
            class-name="small-padding fixed-width"
          >
            <template #default="scope">
              <el-button
                v-if="scope.row.status === '已提交'"
                type="warning"
                size="small"
                @click="revokeApplication(scope.row)"
              >
                撤销申请
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
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
    <el-dialog
        title="登记回院时间"
        :visible.sync="dialogVisible"
        width="400px"
        :before-close="handleDialogClose"
        >
        <el-form :model="form" ref="returnForm" label-width="100px">
            <el-form-item label="实际回院时间" prop="actualReturnTime" :rules="[{ required: true, message: '请选择回院时间', trigger: 'change' }]">
            <el-date-picker
                v-model="form.actualReturnTime"
                type="datetime"
                placeholder="选择实际回院时间"
                style="width: 100%;"
            />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitReturnTime">提交</el-button>
        </template>
        </el-dialog>
        <RegisterOutRequest
            ref="RegisterOutRequestRef"></RegisterOutRequest>
  </div>
</template>

<script>
import axios from "axios";
import {
  defineComponent,
  reactive,
  ref,
  computed,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import RegisterOutRequest from "./RegisterOutRequest.vue";

export default defineComponent({
   components: {
        RegisterOutRequest
    },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const bedNoFromQuery = route.query.bedId || ''; // 注意：这里应与上个页面传值保持一致
    const clientNameFromQuery = route.query.clientName || '';
    const clientIdFromQuery = route.query.clientId;
    const RegisterOutRequestRef = ref(null);

    const dataContainer = reactive({
      loading: false,
      form: {},
      params: {
        pageNum: 1,
        pageSize: 10,
      },
      config: {
        total: 0,
      },
      currDataList: [],
      showSearch: true,
    });

    const getDataList = async (clientId) => {
      dataContainer.loading = true;
      try {
        const res = await axios.get(
          "http://localhost:8080/helpGiver/checkout/listByClientId",
          {
            params: {
              clientId: clientId,
              pageNum: dataContainer.params.pageNum,
              pageSize: dataContainer.params.pageSize,
            },
          }
        );

        if (res.data.isOk) {
          const list = res.data.data || [];
            // 给每条记录加上 bedNo（来自 route.query）
          const bedNo = route.query.bedId || ''; // 或 route.query.bedNo，根据你的传参决定
          list.forEach(item => {
            item.bedNo = bedNo;
            item.clientName = clientNameFromQuery;
          });
          dataContainer.currDataList = list;
          dataContainer.config.total = list.length; // 真实项目可用后端总数替换
        } else {
          dataContainer.currDataList = [];
          dataContainer.config.total = 0;
          ElMessage.error(res.data.msg || "查询失败");
        }
      } catch (error) {
        dataContainer.currDataList = [];
        dataContainer.config.total = 0;
        ElMessage.error("网络请求失败，请检查连接");
      } finally {
        dataContainer.loading = false;
      }
    };

    if (clientIdFromQuery) {
      getDataList(clientIdFromQuery);
    } else {
      getDataList(null);
    }

    const refreshList = () => {
        getDataList(clientIdFromQuery);
    };

    // 状态颜色映射
    const getTagType = (status) => {
      switch (status) {
        case "通过":
          return "success";
        case "已提交":
          return "warning";
        case "拒绝":
          return "danger";
        default:
          return "info";
      }
    };

    //登记退住申请
    // 点击添加退住申请按钮时，获取选中的行数据并传递给弹窗
    const handleAdd = () => {
        const clientId = clientIdFromQuery; // 获取 clientId
        const clientName = route.query.clientName || ''; // 从路由获取 clientName

        // 获取选中的行数据
        const selectedRow = dataContainer.currDataList[0]; // 假设取第一个选中的行，可以根据实际情况调整

        // 获取入住时间
        const checkInDate = selectedRow ? selectedRow.checkInDate : '';

        // 调用子组件的初始化方法，传递数据
        if (RegisterOutRequestRef.value) {
          RegisterOutRequestRef.value.initData(true, {
            clientId: clientId,
            clientName: clientName,
            checkInDate: checkInDate, // 传递入住时间给弹窗
          });
        }
      };

    const revokeApplication = async (row) => {
        // 使用 ElMessageBox 进行确认
        ElMessageBox.confirm('确定要撤销该退住申请吗?', '撤销申请', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })
        .then(async () => {
            try {
                const res = await axios.delete(`http://localhost:8080/helpGiver/deleteCheckOutRequest/${row.id}`);
                if (res.data.isOk) {
                    ElMessage.success('撤销申请成功');
                    // 刷新列表
                    refreshList();
                } else {
                    ElMessage.error(res.data.msg || '撤销失败');
                }
            } catch (error) {
                console.error(error);
                ElMessage.error('请求失败，请稍后重试');
            }
        })
        .catch(() => {
            // 用户点击取消，不做任何操作
            ElMessage.info('撤销操作已取消');
        });
    };



    // 分页变化
    const handleSizeChange = (size) => {
      dataContainer.params.pageSize = size;
      dataContainer.params.pageNum = 1;
      getDataList(clientIdFromQuery);
    };
    const handleCurrentChange = (page) => {
      dataContainer.params.pageNum = page;
      getDataList(clientIdFromQuery);
    };

    // 复制单元格内容
    const handleCopyVale = (row, column, cell, event) => {
      const text = event.target.innerText;
      navigator.clipboard.writeText(text).then(() => {
        ElMessage.success("复制成功，内容为：" + text);
      });
    };

    // 选中行变化
    const handleSelectionChange = (selection) => {
      // 如果需要可处理选中ID
    };

    // 保留你的返回按钮函数
    const goBack = () => {
      router.back();
    };

    return {
      dataContainer,
      getDataList,
      handleCopyVale,
      handleSelectionChange,
      getTagType,
      revokeApplication,
      handleSizeChange,
      handleCurrentChange,
      goBack,
      RegisterOutRequestRef,
      refreshList,
      handleAdd
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
