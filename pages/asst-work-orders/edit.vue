<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="project_id" label="关联项目" required>
        <uni-data-picker :placeholder="project_name" readonly v-model="formData.project_id" collection="asst-projects" field="_id as value, _id as text"></uni-data-picker>
      </uni-forms-item>
      <uni-forms-item name="title" label="标题" required>
        <uni-easyinput placeholder="工单标题" v-model="formData.title" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="type" label="工单类型">
        <uni-data-checkbox v-model="formData.type" :localdata="formOptions.type_localdata" @change="initComponent"></uni-data-checkbox>
      </uni-forms-item>
	  <!-- 工单详情组件 -->
	  <component ref="info" :is="component" :formData="formData.info" :product_id="product_id" @setInfo="setInfo" style="margin-bottom: 22px;"></component>
      <uni-forms-item name="status" label="工单状态">
        <uni-data-checkbox v-model="formData.status" :localdata="formOptions.status_localdata"></uni-data-checkbox>
      </uni-forms-item>
      <view class="uni-button-group">
        <button type="primary" class="uni-button" style="width: 100px;" @click="submit">提交</button>
        <navigator open-type="navigateBack" style="margin-left: 15px;">
          <button class="uni-button" style="width: 100px;">返回</button>
        </navigator>
      </view>
    </uni-forms>
  </view>
</template>

<script>
  import { validator } from '../../js_sdk/validator/asst-work-orders.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'asst-work-orders';

  function getValidator(fields) {
    let result = {}
    for (let key in validator) {
      if (fields.includes(key)) {
        result[key] = validator[key]
      }
    }
    return result
  }

  

  export default {
    data() {
      let formData = {
        "project_id": "",
        "title": "",
        "type": "bug",
        "status": 0
      }
      return {
		component: null,
		project_name: '请选择',
		product_id: '',
		submitData: null,
        formData,
        formOptions: {
          "type_localdata": [
            {
              "text": "Bug",
              "value": "bug"
            },
            {
              "text": "需求",
              "value": "requirement"
            },
            {
              "text": "运维",
              "value": "maintenance"
            },
            {
              "text": "采购",
              "value": "purchase"
            },
            {
              "text": "现场",
              "value": "scene"
            },
            {
              "text": "其他",
              "value": "other"
            }
          ],
          "status_localdata": [
            {
              "text": "待审核",
              "value": 0
            },
            {
              "text": "审核未通过",
              "value": 1
            },
            {
              "text": "进行中",
              "value": 2
            },
            {
              "text": "完成",
              "value": 3
            }
          ]
        },
        rules: {
          ...getValidator(Object.keys(formData))
        }
      }
    },
    onLoad(e) {
      if (e.id) {
        const id = e.id
        this.formDataId = id
        this.getDetail(id)
      }
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
      /**
       * 切换工单类型
       */
      initComponent() {
		  this.component = (resolve) => require([`@/pages/asst-work-orders/info-${this.formData.type}/add`], resolve);
      },
      
      /**
       * 给工单详情info属性赋值
       */
      setInfo(info) {
		  this.submitData['info'] = info;
		  this.submitForm(this.submitData)
      },
	  
      /**
       * 验证表单并提交
       */
      submit() {
        uni.showLoading({
			mask: true
        })
        this.$refs.form.validate().then((res) => {
			this.submitData = res;
			this.$refs.info.submit()
        }).catch(() => {
        }).finally(() => {
          uni.hideLoading()
        })
      },

      /**
       * 提交表单
       */
      submitForm(value) {
        return db.collection(dbCollectionName).doc(this.formDataId).update(value).then((res) => {
          uni.showToast({
            title: '修改成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        })
      },

      /**
       * 获取表单数据
       * @param {Object} id
       */
      getDetail(id) {
        uni.showLoading({
          mask: true
        })
        db.collection(dbCollectionName).doc(id).field("project_id,title,type,status,info").get().then((res) => {
			const data = res.result.data[0]
			if (data) {
				this.formData = data
				// 先过滤asst-projects表，再生成虚拟联表，获取company、product
				const projects = db.collection('asst-projects').where(`_id=='${data.project_id}'`).getTemp() // 注意是getTemp不是get
				db.collection(projects, 'asst-companies', 'asst-products').get().then((res2) => {
				  const data2 = res2.result.data[0]
				  if (data2) {
					this.project_name = data2.company_id[0].name+'-'+data2.product_id[0].name;
					this.product_id = data2.product_id[0]._id;
					this.initComponent();
				  }
				}).catch((err) => {
				  uni.showModal({
					content: err.message || '请求服务失败',
					showCancel: false
				  })
				})
			}
        }).catch((err) => {
			uni.showModal({
				content: err.message || '请求服务失败',
				showCancel: false
			})
        }).finally(() => {
			uni.hideLoading()
        })
      }
    }
  }
</script>
