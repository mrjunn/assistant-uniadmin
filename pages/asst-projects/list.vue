<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<view class="uni-group">
				<input class="uni-search" type="text" v-model="query" @confirm="search"
					:placeholder="$t('common.placeholder.query')" />
				<button class="uni-button hide-on-phone" type="default" size="mini"
					@click="search">{{$t('common.button.search')}}</button>
				<button class="uni-button" type="primary" size="mini"
					@click="navigateTo('./add')">{{$t('common.button.add')}}</button>
				<button class="uni-button" type="warn" size="mini" :disabled="!selectedIndexs.length"
					@click="delTable">{{$t('common.button.batchDelete')}}</button>
				<!-- #ifdef H5 -->
				<download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData"
					:type="exportExcel.type" :name="exportExcel.filename">
					<button class="uni-button" type="primary" size="mini">{{$t('common.button.exportExcel')}}</button>
				</download-excel>
				<!-- #endif -->
			</view>
		</view>
		<view class="uni-container">
		  <unicloud-db ref="udb" :collection="collectionList" :where="where" page-data="replace"
			:orderby="orderby" :getcount="true" :page-size="options.pageSize" :page-current="options.pageCurrent"
			v-slot:default="{data,pagination,loading,error,options}" :options="options" loadtime="manual" @load="onqueryload">
			<uni-table ref="table" :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe type="selection" @selection-change="selectionChange">
			  <uni-tr>
				<uni-th align="center">关联企业</uni-th>
				<uni-th align="center">关联产品</uni-th>
				<uni-th align="center" filter-type="select" :filter-data="options.filterData.status_localdata" @filter-change="filterChange($event, 'status')">项目状态</uni-th>
				<uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'delivery_date')" sortable @sort-change="sortChange($event, 'delivery_date')">交付日期</uni-th>
				<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'comment')" sortable @sort-change="sortChange($event, 'comment')">备注</uni-th>
				<uni-th align="center" sortable @sort-change="sortChange($event, 'files')">相关附件</uni-th>
				<uni-th align="center" sortable @sort-change="sortChange($event, 'creator_id')">创建者</uni-th>
				<uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'create_date')" sortable @sort-change="sortChange($event, 'create_date')">创建时间</uni-th>
				<uni-th align="center">项目经理</uni-th>
				<uni-th align="center">操作</uni-th>
			  </uni-tr>
			  <uni-tr v-for="(item,index) in data" :key="index">
				<uni-td align="center">{{item.company_id && item.company_id[0] && item.company_id[0].text}}</uni-td>
				<uni-td align="center">{{item.product_id && item.product_id[0] && item.product_id[0].text}}</uni-td>
				<uni-td align="center">{{options.status_valuetotext[item.status]}}</uni-td>
				<uni-td align="center">
				  <uni-dateformat :threshold="[0, 0]" :date="item.delivery_date"></uni-dateformat>
				</uni-td>
				<uni-td align="center">{{item.comment}}</uni-td>
				<uni-td align="center">
				  <template v-for="(file, j) in item.files">
					<uni-file-picker v-if="file.fileType == 'image'" :value="file" :file-mediatype="file.fileType" :imageStyles="imageStyles" readonly></uni-file-picker>
					<uni-link v-else :href="file.url" :text="file.name"></uni-link>
					<template v-if="j!==item.files.length-1">、</template>
				  </template>
				</uni-td>
				<uni-td align="center">{{item.creator_id && item.creator_id[0] && item.creator_id[0].text}}</uni-td>
				<uni-td align="center">
				  <uni-dateformat :threshold="[0, 0]" :date="item.create_date"></uni-dateformat>
				</uni-td>
				<uni-td align="center">
					<template v-for="(member, ind) in item.member_ids">
						{{member.text}}
						<template v-if="ind!==item.member_ids.length-1">、</template>
					</template>
				</uni-td>
				<uni-td align="center">
				  <view class="uni-group">
					<button @click="navigateTo(`../asst-work-orders/add?project_id=${item._id}&project_name=${item.company_id[0].text}-${item.product_id[0].text}&product_id=${item.product_id[0]._id}`, false)" class="uni-button" size="mini" type="warm" title="创建工单">+工单</button>
					<button @click="navigateTo('./edit?id='+item._id, false)" class="uni-button" size="mini" type="primary">修改</button>
					<button @click="confirmDelete(item._id)" class="uni-button" size="mini" type="warn">删除</button>
				  </view>
				</uni-td>
			  </uni-tr>
			</uni-table>
			<view class="uni-pagination-box">
			  <uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current" :total="pagination.count" @change="onPageChanged" />
			</view>
		  </unicloud-db>
		</view>
	</view>
</template>

<script>
  import { enumConverter, filterToWhere } from '../../js_sdk/validator/asst-projects.js';

  const db = uniCloud.database()
  // 表查询配置
  const dbOrderBy = '' // 排序字段
  const dbSearchFields = [] // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
  // 分页配置
  const pageSize = 20
  const pageCurrent = 1

  const orderByMapping = {
    "ascending": "asc",
    "descending": "desc"
  }

  export default {
    data() {
      return {
        collectionList: [ db.collection('asst-projects').field('company_id,product_id,status,delivery_date,comment,files,creator_id,create_date,member_ids').getTemp(),db.collection('asst-companies').field('_id, name as text').getTemp(),db.collection('asst-products').field('_id, name as text').getTemp(),db.collection('uni-id-users').field('_id, username as text').getTemp() ],
        query: '',
        where: '',
        orderby: dbOrderBy,
        orderByFieldName: "",
        selectedIndexs: [],
        options: {
          pageSize,
          pageCurrent,
          filterData: {
            "status_localdata": [
              {
                "text": "待启动",
                "value": 0
              },
              {
                "text": "开发中",
                "value": 1
              },
              {
                "text": "运维",
                "value": 2
              },
              {
                "text": "已完结",
                "value": 3
              },
              {
                "text": "停滞",
                "value": 4
              }
            ]
          },
          ...enumConverter
        },
        imageStyles: {
          width: 64,
          height: 64
        },
        exportExcel: {
          "filename": "asst-projects.xls",
          "type": "xls",
          "fields": {
            "关联企业": "company_id",
            "关联产品": "product_id",
            "项目状态": "status",
            "交付日期": "delivery_date",
            "备注": "comment",
            "相关附件": "files",
            "创建者": "creator_id",
            "创建时间": "create_date",
            "项目经理": "member_ids"
          }
        },
        exportExcelData: []
      }
    },
    onLoad() {
      this._filter = {}
    },
    onReady() {
      this.$refs.udb.loadData()
    },
    methods: {
      onqueryload(data) {
        this.exportExcelData = data
      },
      getWhere() {
        const query = this.query.trim()
        if (!query) {
          return ''
        }
        const queryRe = new RegExp(query, 'i')
        return dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ')
      },
      search() {
        const newWhere = this.getWhere()
        this.where = newWhere
        this.$nextTick(() => {
          this.loadData()
        })
      },
      loadData(clear = true) {
        this.$refs.udb.loadData({
          clear
        })
      },
      onPageChanged(e) {
        this.selectedIndexs.length = 0
        this.$refs.table.clearSelection()
        this.$refs.udb.loadData({
          current: e.current
        })
      },
      navigateTo(url, clear) {
        // clear 表示刷新列表时是否清除页码，true 表示刷新并回到列表第 1 页，默认为 true
        uni.navigateTo({
          url,
          events: {
            refreshData: () => {
              this.loadData(clear)
            }
          }
        })
      },
      // 多选处理
      selectedItems() {
        var dataList = this.$refs.udb.dataList
        return this.selectedIndexs.map(i => dataList[i]._id)
      },
      // 批量删除
      delTable() {
        this.$refs.udb.remove(this.selectedItems(), {
          success:(res) => {
            this.$refs.table.clearSelection()
          }
        })
      },
      // 多选
      selectionChange(e) {
        this.selectedIndexs = e.detail.index
      },
      confirmDelete(id) {
        this.$refs.udb.remove(id, {
          success:(res) => {
            this.$refs.table.clearSelection()
          }
        })
      },
      sortChange(e, name) {
        this.orderByFieldName = name;
        if (e.order) {
          this.orderby = name + ' ' + orderByMapping[e.order]
        } else {
          this.orderby = ''
        }
        this.$refs.table.clearSelection()
        this.$nextTick(() => {
          this.$refs.udb.loadData()
        })
      },
      filterChange(e, name) {
        this._filter[name] = {
          type: e.filterType,
          value: e.filter
        }
        let newWhere = filterToWhere(this._filter, db.command)
        if (Object.keys(newWhere).length) {
          this.where = newWhere
        } else {
          this.where = ''
        }
        this.$nextTick(() => {
          this.$refs.udb.loadData()
        })
      }
    }
  }
</script>

<style>
</style>
