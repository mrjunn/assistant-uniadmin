<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="company_id" label="关联企业">
        <uni-data-picker v-model="formData.company_id" collection="asst-companies" orderby="value asc" field="_id as value, name as text"></uni-data-picker>
      </uni-forms-item>
      <uni-forms-item name="username" label="用户名" required>
        <uni-easyinput placeholder="用户名，不允许重复" v-model="formData.username" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="password" label="密码" required>
        <uni-easyinput placeholder="密码，加密存储" v-model="formData.password" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="status" label="用户状态">
        <uni-data-checkbox v-model="formData.status" :localdata="formOptions.status_localdata"></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item name="mobile" label="手机号码">
        <uni-easyinput placeholder="手机号码" v-model="formData.mobile" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="email" label="邮箱">
        <uni-easyinput placeholder="邮箱地址" v-model="formData.email" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="avatar" label="头像地址">
        <uni-easyinput placeholder="头像地址" v-model="formData.avatar" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="role" label="角色">
        <uni-data-picker :multiple="true" v-model="formData.role" collection="uni-id-roles" field="role_id as value, role_name as text"></uni-data-picker>
      </uni-forms-item>
      <uni-forms-item name="dcloud_appid" label="可登陆应用appid">
        <uni-data-picker :multiple="true" v-model="formData.dcloud_appid" collection="opendb-app-list" field="appid as value, name as text"></uni-data-picker>
      </uni-forms-item>
      <uni-forms-item name="tags" label="用户标签tagid">
        <uni-data-picker :multiple="true" v-model="formData.tags" collection="uni-id-tag" field="tagid as value, name as text"></uni-data-picker>
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
  import { validator } from '../../../js_sdk/validator/uni-id-users.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'uni-id-users';

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
        "company_id": "",
        "username": "",
        "password": "",
        "status": 0,
        "mobile": "",
        "email": "",
        "avatar": "",
        "role": [],
        "dcloud_appid": [],
        "tags": []
      }
      return {
        formData,
        formOptions: {
          "status_localdata": [
            {
              "text": "正常",
              "value": 0
            },
            {
              "text": "禁用",
              "value": 1
            },
            {
              "text": "审核中",
              "value": 2
            },
            {
              "text": "审核拒绝",
              "value": 3
            }
          ]
        },
        rules: {
          ...getValidator(Object.keys(formData))
        }
      }
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
      
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
        return db.collection(dbCollectionName).add(value).then((res) => {
          uni.showToast({
            title: '新增成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        })
      }
    }
  }
</script>
