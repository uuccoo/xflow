import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useFormDesignStore = defineStore('formDesign', () => {
  // 设计区域的表单控件列表
  const formItems = ref([])

  // 当前选中的组件
  const activeItem = ref(null)

  // 视图模式 - 'mobile' 或 'pc'
  const viewMode = ref('mobile')

  // 组件配置数据 - 保持不变，不需要持久化
  const components = reactive([
    {
      category: '布局组件',
      items: [
        {
          type: 'columns',
          icon: 'Grid',
          label: '分栏容器',
          title: '分栏容器',
          children: [],
          layoutValue: '1:1',
        },
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

  // 设置视图模式
  const setViewMode = (mode) => {
    viewMode.value = mode
  }

  // 克隆组件
  const cloneComponent = (component) => {
    if (component.type === 'columns') {
      // 创建分栏容器时，直接使用一维数组存储子组件
      return {
        ...component,
        id: Date.now(),
        title: component.title || '分栏容器',
        children: [], // 使用一维数组存储子组件
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
  const deleteItem = (component, index, parentComponent) => {
    if (parentComponent && parentComponent.type === 'columns' && parentComponent.children) {
      // 从分栏容器的children中删除
      parentComponent.children.splice(index, 1)
    } else {
      // 从表单项中删除
      formItems.value.splice(index, 1)
    }

    // 如果删除的是当前选中的组件，则取消选中
    if (activeItem.value && activeItem.value === component) {
      activeItem.value = null
    }
  }

  // 复制组件
  const copyItem = (component, index, parentComponent) => {
    // 确定要操作的数组
    const arr = parentComponent?.type === 'columns' ? parentComponent.children : formItems.value
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
    } else if (component.children) {
      // 如果是分栏容器，递归处理其中的子组件
      for (const childComponent of component.children) {
        updateComponentIds(childComponent)
      }
    }
  }

  // 更新分栏布局
  const updateColumnsLayout = (layout) => {
    if (!activeItem.value || activeItem.value.type !== 'columns') return
    activeItem.value.layoutValue = layout
  }

  // 处理组件选择事件
  const handleSelectComponent = (component) => {
    activeItem.value = component
  }

  // 处理组件复制事件
  const handleCopyComponent = (component, index, parentComponent) => {
    if (index !== undefined) {
      copyItem(component, index, parentComponent)
    }
  }

  // 处理组件删除事件
  const handleDeleteComponent = (component, index, parentComponent) => {
    if (index !== undefined) {
      deleteItem(component, index, parentComponent)
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
    viewMode,
    setViewMode,
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
