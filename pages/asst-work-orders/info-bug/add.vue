<template>
  <view class="uni-container work-order-info">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="menu" label="模块菜单">
		<uni-data-picker v-model="formData.menu" :localdata="menus" :map="{text:'name',value:'id'}"></uni-data-picker>
      </uni-forms-item>
      <uni-forms-item name="comment" label="备注">
        <textarea placeholder="备注" @input="binddata('comment', $event.detail.value)" class="uni-textarea-border" v-model="formData.comment" trim="both"></textarea>
      </uni-forms-item>
      <uni-forms-item name="files" label="相关附件">
        <uni-file-picker file-mediatype="all" :limit="100" return-type="array" v-model="formData.files"></uni-file-picker>
      </uni-forms-item>
    </uni-forms>
  </view>
</template>

<script>
  import { validator } from '../../../js_sdk/validator/asst-woi-bug.js';

  const db = uniCloud.database();

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
	props:{
		formData: {
			type: Object,
			default() {
				return {
					"menu": "",
					"comment": "",
					"files": []
				}
			}
		},
		product_id: {
			type: String,
			default: ''
		}
	},
    data() {
      return {
		menus: [],
        formOptions: {},
        rules: null
      }
    },
    // onReady() { // 应该是uniapp中作为外层页面组件的的vue页面 没有uniapp的生命周期
    //   this.$refs.form.setRules(this.rules);
    // },
	created() {
		db.collection('asst-products')
			.doc(`${this.product_id}`) // == .where('_id=="62f7d3fa5a1bef0001507c67"')
			.get()
			.then((res)=>{
				this.menus = JSON.parse(res.result.data[0].menus)
			}).catch((err)=>{
				// console.log(err);
			})
	},
	mounted() {
		this.rules = {
          ...getValidator(Object.keys(this.formData))
        }
		this.$refs.form.setRules(this.rules);
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
			this.$emit('setInfo', res)
        }).catch(() => {
        }).finally(() => {
          uni.hideLoading()
        })
      }
    }
  }
</script>
