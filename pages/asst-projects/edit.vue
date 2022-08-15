<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="product_id" label="关联产品" required>
        <uni-data-picker v-model="formData.product_id" collection="asst-products" orderby="value asc" field="_id as value, name as text"></uni-data-picker>
      </uni-forms-item>
      <uni-forms-item name="company_id" label="关联企业" required>
        <uni-data-picker v-model="formData.company_id" collection="asst-companies" orderby="value asc" field="_id as value, name as text"></uni-data-picker>
      </uni-forms-item>
      <uni-forms-item name="status" label="项目状态">
        <uni-data-checkbox v-model="formData.status" :localdata="formOptions.status_localdata"></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item name="delivery_date" label="交付日期">
        <uni-datetime-picker return-type="timestamp" v-model="formData.delivery_date"></uni-datetime-picker>
      </uni-forms-item>
      <uni-forms-item name="comment" label="备注">
        <textarea placeholder="备注" @input="binddata('comment', $event.detail.value)" class="uni-textarea-border" v-model="formData.comment" trim="both"></textarea>
      </uni-forms-item>
      <uni-forms-item name="files" label="相关附件">
        <uni-file-picker file-mediatype="all" :multiple="true" v-model="formData.files" @delete="deleteFile"></uni-file-picker>
      </uni-forms-item>
      <uni-forms-item name="member_ids" label="项目经理">
        <uni-data-checkbox :multiple="true" v-model="formData.member_ids" collection="uni-id-users" where="company_id=='62f73b1d7f623b0001139e88'&&'project_manager' in role" field="_id as value, username as text"></uni-data-checkbox>
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
  import { validator } from '../../js_sdk/validator/asst-projects.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'asst-projects';

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
        "product_id": "",
        "company_id": "",
        "status": 0,
        "delivery_date": null,
        "comment": "",
        "files": [],
        "member_ids": []
      }
      return {
        formData,
        formOptions: {
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
		deleteFile(file){
			let record = {
				url: file.tempFile.url,
				create_date: new Date().getTime()
			}
			const db = uniCloud.database();
			db.collection('asst-deleted-files').add(record).then(res=>{
				console.log('asst-deleted-files.add', res);
			}).catch(err=>{
				console.log('asst-deleted-files.add fail', err);
			})
		},
      /**
       * 验证表单并提交
       */
      submit() {
        uni.showLoading({
          mask: true
        })
        this.$refs.form.validate().then((res) => {
          return this.submitForm(res)
        }).catch(() => {
        }).finally(() => {
          uni.hideLoading()
        })
      },

      /**
       * 提交表单
       */
      submitForm(value) {
        // 使用 clientDB 提交数据
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
        db.collection(dbCollectionName).doc(id).field("product_id,company_id,status,delivery_date,comment,files,member_ids").get().then((res) => {
          const data = res.result.data[0]
          if (data) {
            this.formData = data
            
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
