// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "product_id": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "关联产品"
  },
  "company_id": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "关联企业"
  },
  "status": {
    "rules": [
      {
        "format": "int"
      },
      {
        "range": [
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
      }
    ],
    "defaultValue": 0,
    "label": "项目状态"
  },
  "delivery_date": {
    "rules": [
      {
        "format": "timestamp"
      }
    ],
    "label": "交付日期"
  },
  "comment": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "备注"
  },
  "files": {
    "rules": [
      {
        "format": "array"
      }
    ],
    "label": "相关附件"
  },
  "member_ids": {
    "rules": [
      {
        "format": "array"
      }
    ],
    "label": "项目经理"
  }
}

const enumConverter = {
  "status_valuetotext": {
    "0": "待启动",
    "1": "开发中",
    "2": "运维",
    "3": "已完结",
    "4": "停滞"
  }
}

function filterToWhere(filter, command) {
  let where = {}
  for (let field in filter) {
    let { type, value } = filter[field]
    switch (type) {
      case "search":
        if (typeof value === 'string' && value.length) {
          where[field] = new RegExp(value)
        }
        break;
      case "select":
        if (value.length) {
          let selectValue = []
          for (let s of value) {
            selectValue.push(command.eq(s))
          }
          where[field] = command.or(selectValue)
        }
        break;
      case "range":
        if (value.length) {
          let gt = value[0]
          let lt = value[1]
          where[field] = command.and([command.gte(gt), command.lte(lt)])
        }
        break;
      case "date":
        if (value.length) {
          let [s, e] = value
          let startDate = new Date(s)
          let endDate = new Date(e)
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
      case "timestamp":
        if (value.length) {
          let [startDate, endDate] = value
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
    }
  }
  return where
}

export { validator, enumConverter, filterToWhere }
