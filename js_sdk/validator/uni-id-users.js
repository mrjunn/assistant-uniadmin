// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "company_id": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "关联企业"
  },
  "username": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      },
      {
        "minLength": 2
      }
    ],
    "label": "用户名"
  },
  "password": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      },
      {
        "minLength": 6
      }
    ],
    "label": "密码"
  },
  "status": {
    "rules": [
      {
        "format": "int"
      },
      {
        "range": [
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
      }
    ],
    "defaultValue": 0,
    "label": "用户状态"
  },
  "mobile": {
    "rules": [
      {
        "format": "string"
      },
      {
        "pattern": "^\\+?[0-9-]{3,20}$"
      }
    ],
    "label": "手机号码"
  },
  "email": {
    "rules": [
      {
        "format": "string"
      },
      {
        "format": "email"
      }
    ],
    "label": "邮箱"
  },
  "avatar": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "头像地址"
  },
  "role": {
    "rules": [
      {
        "format": "array"
      }
    ],
    "label": "角色"
  },
  "dcloud_appid": {
    "rules": [
      {
        "format": "array"
      }
    ],
    "label": "可登陆应用appid"
  },
  "tags": {
    "rules": [
      {
        "format": "array"
      }
    ],
    "label": "用户标签tagid"
  }
}

const enumConverter = {
  "status_valuetotext": {
    "0": "正常",
    "1": "禁用",
    "2": "审核中",
    "3": "审核拒绝"
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
