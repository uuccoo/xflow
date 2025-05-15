import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useFormDesignStore = defineStore('formDesign', () => {
  // 设计区域的表单控件列表
  const formItems = ref([])

  // 当前选中的组件
  const activeItem = ref(null)

  // 组件配置数据 - 保持不变，不需要持久化
  const components = reactive([
    {
      category: '布局组件',
      items: [
        { type: 'columns', icon: 'Grid', label: '分栏容器', columns: [], layoutValue: '1:1' },
      ],
    },
    {
      category: '基础组件',
      items: [
        {
          type: 'input',
          icon: 'EditPen',
          label: '单行文本',
          field: '',
          title: '',
          placeholder: '请输入',
          required: false,
          validator: '',
          defaultValue: '',
        },
        {
          type: 'textarea',
          icon: 'Tickets',
          label: '多行文本',
          field: '',
          title: '',
          placeholder: '请输入',
          required: false,
          validator: '',
          defaultValue: '',
        },
        {
          type: 'number',
          icon: 'EditPen',
          label: '数字输入框',
          field: '',
          title: '',
          placeholder: '请输入数字',
          required: false,
          validator: '',
          defaultValue: '',
          min: 0,
          max: 100,
          step: 1,
        },
        {
          type: 'text',
          icon: 'InfoFilled',
          label: '说明文字',
          field: '',
          title: '说明标题',
          content: '这里是说明文字内容',
          fontSize: '14px',
          color: '#606266',
        },
        {
          type: 'radio',
          icon: 'Check',
          label: '单选框',
          field: '',
          title: '',
          placeholder: '请输入',
          required: false,
          options: [
            { label: '选项1', value: '1' },
            { label: '选项2', value: '2' },
          ],
          defaultValue: '',
          asDropdown: false, // 新增属性：是否以下拉框形式展示
        },
        {
          type: 'checkbox',
          icon: 'CircleCheck',
          label: '多选框',
          field: '',
          title: '',
          placeholder: '请输入',
          required: false,
          options: [
            { label: '选项1', value: '1' },
            { label: '选项2', value: '2' },
          ],
          defaultValue: [],
        },
        {
          type: 'date',
          icon: 'Calendar',
          label: '日期选择',
          field: '',
          title: '',
          placeholder: '请输入',
          required: false,
          defaultValue: '',
        },
        {
          type: 'daterange',
          icon: 'Calendar',
          label: '日期区间',
          field: '',
          title: '',
          placeholder: '请选择日期时间区间',
          required: false,
          defaultValue: [],
          format: 'YYYY-MM-DD HH:mm:ss',
          rangeSeparator: '至',
        },
        {
          type: 'upload',
          icon: 'Upload',
          label: '文件上传',
          field: '',
          title: '',
          placeholder: '请输入',
          required: false,
          defaultValue: [],
        },
        {
          type: 'image',
          icon: 'Picture',
          label: '图片上传',
          field: '',
          title: '',
          placeholder: '请输入',
          required: false,
          defaultValue: [],
        },
      ],
    },
    {
      category: '高级组件',
      items: [],
    },
  ])

  // 克隆组件
  const cloneComponent = (component) => {
    if (component.type === 'columns') {
      // 创建分栏容器时，默认创建两个等宽的列
      return {
        ...component,
        id: Date.now(),
        columns: [
          { width: 50, children: [] },
          { width: 50, children: [] },
        ],
      }
    }
    return {
      ...component,
      id: Date.now(),
      title: component.label,
      field: component.type + Date.now(),
      placeholder: component.placeholder || '',
    }
  }

  // 添加组件
  const addComponent = (component) => {
    formItems.value.push(cloneComponent(component))
  }

  // 选中组件
  const selectItem = (item) => {
    activeItem.value = item

    // 如果选中的是分栏组件，并且没有布局值，设置默认值
    if (item.type === 'columns' && !item.layoutValue) {
      item.layoutValue = '1:1'
    }
  }

  // 删除组件
  const deleteItem = (component, index, parentColumn) => {
    const arr = parentColumn?.children || formItems.value
    arr.splice(index, 1)
    // 如果删除的是当前选中的组件，则取消选中
    if (activeItem.value && activeItem.value === arr[index]) {
      activeItem.value = null
    }
  }

  // 复制组件
  const copyItem = (component, index, parentColumn) => {
    const arr = parentColumn?.children || formItems.value
    const sourceItem = arr[index]
    // 深拷贝组件
    const newItem = JSON.parse(JSON.stringify(sourceItem))

    // 递归更新组件和所有子组件的ID和编码
    updateComponentIds(newItem)

    // 将复制的组件插入到原组件后面
    arr.splice(index + 1, 0, newItem)
  }

  // 递归更新组件和所有子组件的ID和编码
  const updateComponentIds = (component) => {
    // 生成更可靠的唯一ID
    const timestamp = Date.now()
    const randomChars = Math.random().toString(36).substring(2, 8)
    component.id = `${timestamp}-${randomChars}`

    // 更新不同类型组件的编码
    if (component.type !== 'columns') {
      // 保持类型不变，但生成新的编码
      component.field = `${component.type}_${timestamp}`
    }

    // 如果是分栏容器，递归处理其中的子组件
    if (component.type === 'columns' && component.columns) {
      for (const column of component.columns) {
        if (column.children && column.children.length > 0) {
          for (const childComponent of column.children) {
            updateComponentIds(childComponent)
          }
        }
      }
    }
  }

  // 更新分栏布局
  const updateColumnsLayout = (layout) => {
    if (!activeItem.value || activeItem.value.type !== 'columns') return

    const columns = activeItem.value.columns
    const widths = layout.split(':').map(Number)
    const total = widths.reduce((sum, w) => sum + w, 0)

    // 计算每个分栏的宽度百分比
    const percentages = widths.map((w) => Math.round((w / total) * 100))

    // 如果列数不一致，需要调整列数
    if (columns.length !== widths.length) {
      if (widths.length > columns.length) {
        // 增加栏数的情况（例如从2栏到3栏）
        const newColumns = []

        // 保留原有栏目及其子组件
        for (let i = 0; i < columns.length; i++) {
          newColumns.push({
            width: percentages[i],
            children: [...columns[i].children], // 保留原有子组件
          })
        }

        // 添加新的空栏目
        for (let i = columns.length; i < widths.length; i++) {
          newColumns.push({
            width: percentages[i],
            children: [], // 新栏目没有子组件
          })
        }

        activeItem.value.columns = newColumns
      } else {
        // 减少栏数的情况（例如从3栏到2栏）
        // 收集被移除栏中的所有子组件
        const orphanedChildren = []
        for (let i = widths.length; i < columns.length; i++) {
          orphanedChildren.push(...columns[i].children)
        }

        // 创建新的栏结构
        const newColumns = []
        for (let i = 0; i < widths.length; i++) {
          newColumns.push({
            width: percentages[i],
            children: [...columns[i].children], // 保留现有栏的子组件
          })
        }

        // 将孤立的子组件均匀分配到剩余的栏中
        if (orphanedChildren.length > 0) {
          orphanedChildren.forEach((child, index) => {
            // 按照余数决定放入哪一栏
            const targetColumnIndex = index % widths.length
            newColumns[targetColumnIndex].children.push(child)
          })
        }

        activeItem.value.columns = newColumns
      }
    } else {
      // 只更新宽度
      columns.forEach((col, index) => {
        col.width = percentages[index]
      })
    }
  }

  // 处理组件选择事件
  const handleSelectComponent = (component) => {
    activeItem.value = component
  }

  // 处理组件复制事件
  const handleCopyComponent = (component, index, parentColumn) => {
    if (index !== undefined) {
      copyItem(component, index, parentColumn)
    }
  }

  // 处理组件删除事件
  const handleDeleteComponent = (component, index, parentColumn) => {
    if (index !== undefined) {
      deleteItem(component, index, parentColumn)
    }
  }

  // 添加单选/多选选项
  const addOption = () => {
    if (!activeItem.value) return
    // 确保组件是单选框或多选框
    if (activeItem.value.type === 'radio' || activeItem.value.type === 'checkbox') {
      // 生成唯一的选项值
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const uniqueValue = `option_${timestamp}_${randomStr}`

      const newOption = {
        label: `选项${activeItem.value.options.length + 1}`,
        value: uniqueValue,
      }
      activeItem.value.options.push(newOption)
    }
  }

  // 移除单选/多选选项
  const removeOption = (index) => {
    if (!activeItem.value) return
    if (activeItem.value.type === 'radio' || activeItem.value.type === 'checkbox') {
      // 至少保留一个选项
      if (activeItem.value.options.length > 1) {
        activeItem.value.options.splice(index, 1)
        // 如果删除的是当前选中的默认值，清空默认值
        if (
          activeItem.value.type === 'radio' &&
          activeItem.value.defaultValue === activeItem.value.options[index]?.value
        ) {
          activeItem.value.defaultValue = ''
        } else if (
          activeItem.value.type === 'checkbox' &&
          activeItem.value.defaultValue.includes(activeItem.value.options[index]?.value)
        ) {
          const valueIndex = activeItem.value.defaultValue.indexOf(
            activeItem.value.options[index].value,
          )
          if (valueIndex > -1) {
            activeItem.value.defaultValue.splice(valueIndex, 1)
          }
        }
      }
    }
  }

  // 移动选项位置
  const moveOption = (index, direction) => {
    if (!activeItem.value) return
    if (activeItem.value.type === 'radio' || activeItem.value.type === 'checkbox') {
      const options = activeItem.value.options
      const newIndex = index + direction

      // 确保新索引在有效范围内
      if (newIndex >= 0 && newIndex < options.length) {
        // 交换选项位置
        ;[options[index], options[newIndex]] = [options[newIndex], options[index]]
      }
    }
  }

  return {
    formItems,
    activeItem,
    components,
    cloneComponent,
    addComponent,
    selectItem,
    updateColumnsLayout,
    handleSelectComponent,
    handleCopyComponent,
    handleDeleteComponent,
    addOption,
    removeOption,
    moveOption,
  }
})
