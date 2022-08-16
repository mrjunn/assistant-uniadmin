// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "project_id": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "关联项目"
  },
  "title": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      },
      {
        "minLength": 4
      }
    ],
    "label": "标题"
  },
  "type": {
    "rules": [
      {
        "format": "string"
      },
      {
        "range": [
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
        ]
      }
    ],
    "defaultValue": "bug",
    "label": "工单类型"
  },
  "status": {
    "rules": [
      {
        "format": "int"
      },
      {
        "range": [
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
      }
    ],
    "defaultValue": 0,
    "label": "工单状态"
  }
}

const enumConverter = {
  "type_valuetotext": {
    "bug": "Bug",
    "requirement": "需求",
    "maintenance": "运维",
    "purchase": "采购",
    "scene": "现场",
    "other": "其他"
  },
  "status_valuetotext": {
    "0": "待审核",
    "1": "审核未通过",
    "2": "进行中",
    "3": "完成"
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
