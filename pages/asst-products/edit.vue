<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="name" label="产品名称" required>
        <uni-easyinput placeholder="产品名称，不允许重复" v-model="formData.name" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="comment" label="备注">
        <textarea placeholder="备注" @input="binddata('comment', $event.detail.value)" class="uni-textarea-border" v-model="formData.comment" trim="both"></textarea>
      </uni-forms-item>
      <uni-forms-item name="files" label="相关附件">
        <uni-file-picker file-mediatype="all" :limit="100" return-type="array" v-model="formData.files" @delete="deleteFile"></uni-file-picker>
      </uni-forms-item>
      <uni-forms-item name="menus" label="模块菜单">
        <textarea placeholder="一个软件类型产品，设定一个通用的软件系统模块菜单，方便对应的项目后续关联工单等，json字符串" @input="binddata('menus', $event.detail.value)" class="uni-textarea-border" v-model="formData.menus" trim="both" :maxlength="-1"></textarea>
      </uni-forms-item>
      <uni-forms-item name="steps" label="基础进程">
        <!-- <uni-data-checkbox :multiple="true" v-model="formData.steps"></uni-data-checkbox> -->
		<template v-for="(item,index) in formData.steps">
			<uni-forms-item class="step-item" :label="index+1+'.'" required :rules="[{'required': true,errorMessage: '进程内容必填'}]" :key="index" :name="['steps',index,'value']">
				<view class="form-item">
					<uni-data-select v-model="formData.steps[index].label" :localdata="stepLabelList" placeholder="选择类别" :clear="false"></uni-data-select>
					<uni-easyinput v-model="formData.steps[index].value" placeholder="请输入进程" />
					<button size="mini" type="default" @click="delStep(index)">删除</button>
				</view>
			</uni-forms-item>
		</template>
		<button class="forms-item-btn-mgt" type="primary" size="mini" @click="addStep">新增进程</button>
      </uni-forms-item>
      <uni-forms-item name="member_ids" label="产品成员">
        <uni-data-checkbox :multiple="true" v-model="formData.member_ids" collection="uni-id-users" where="company_id=='62f73b1d7f623b0001139e88'" field="_id as value, username as text"></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item name="enable" label="产品状态">
        <switch @change="binddata('enable', $event.detail.value)" :checked="formData.enable"></switch>
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
  import { validator } from '../../js_sdk/validator/asst-products.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'asst-products';

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
        "name": "",
        "comment": "",
        "files": [],
        "menus": "",
        "steps": [],
        "member_ids": [],
        "enable": true
      }
      return {
		stepLabelList: [
			{ value: "其他", text: "其他" },
			{ value: "调研", text: "调研" },
			{ value: "开发", text: "开发" },
			{ value: "运维", text: "运维" }
        ],
        formData,
        formOptions: {},
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
				url: file.tempFile.url
			}
			const db = uniCloud.database();
			db.collection('asst-deleted-files').add(record).then(res=>{
				console.log('asst-deleted-files.add', res);
			}).catch(err=>{
				console.log('asst-deleted-files.add fail', err);
			})
		},
		
		addStep(){
			this.formData.steps.push({
				label: '其他',
				value: ''
			})
		},
		
		delStep(id) {
			let index = this.formData.steps.findIndex(v => v.id === id)
			this.formData.steps.splice(index, 1)
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
        db.collection(dbCollectionName).doc(id).field("name,comment,files,menus,steps,member_ids,enable").get().then((res) => {
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
<style>
	::v-deep .step-item .uni-forms-item__label{
		display: none;
	}
	::v-deep .step-item .form-item{
		display: flex;
		align-items: center;
	}
	::v-deep .step-item .uni-stat__select{
		padding: 0px;
		margin-right: 10px;
	}
	::v-deep .step-item .uni-select__input-text{
		width: 60px;
	}
	::v-deep .step-item uni-button{
		height: 35px;
		line-height: 35px;
		margin-left: 10px;
	}
</style>
