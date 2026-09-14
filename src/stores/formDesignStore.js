import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { generateUniqueId } from '@/utils/idGenerator'
import { FormComponentType } from '@/enums'

export const useFormDesignStore = defineStore('formDesign', () => {
  // 创建默认表单设计状态（工厂函数，避免数组引用复用导致串改）
  const createDefaultFormDesignState = () => {
    return {
      formItems: [],
      activeItem: null,
      viewMode: 'mobile',
    }
  }

  // 设计区域的表单控件列表
  const formItems = ref([])

  // 当前选中的组件
  const activeItem = ref(null)

  // 表单设计校验错误信息
  const errors = ref({})

  // 视图模式 - 'mobile' 或 'pc'
  const viewMode = ref('mobile')

  // 组件配置数据 - 保持不变，不需要持久化
  const components = reactive([
    {
      category: '布局组件',
      items: [
        {
          id: '',
          type: FormComponentType.COLUMNS,
          icon: 'Grid',
          name: '分栏容器',
          label: '分栏容器',
          children: [],
          layoutValue: '1:1',
        },
      ],
    },
    {
      category: '基础组件',
      items: [
        {
          id: '',
          type: FormComponentType.INPUT,
          icon: 'EditPen',
          name: '单行文本',
          label: '单行文本',
          placeholder: '请输入',
          required: false,
          defaultValue: '',
        },
        {
          id: '',
          type: FormComponentType.TEXTAREA,
          icon: 'Tickets',
          name: '多行文本',
          label: '多行文本',
          placeholder: '请输入',
          required: false,
          defaultValue: '',
        },
        {
          id: '',
          type: FormComponentType.NUMBER,
          icon: 'EditPen',
          name: '数字输入框',
          label: '数字输入框',
          placeholder: '请输入数字',
          required: false,
          defaultValue: undefined,
          precision: undefined, // 小数位数限制
        },
        {
          id: '',
          type: FormComponentType.TEXT,
          icon: 'InfoFilled',
          name: '说明文字',
          label: '说明文字',
          content: '这里是说明文字内容',
        },
        {
          id: '',
          type: FormComponentType.RADIO,
          icon: 'Check',
          name: '单选框',
          label: '单选框',
          placeholder: '请选择',
          required: false,
          options: [
            { label: '选项1', value: '1' },
            { label: '选项2', value: '2' },
          ],
          defaultValue: '',
          optionTile: false, // 选项平铺
        },
        {
          id: '',
          type: FormComponentType.CHECKBOX,
          icon: 'CircleCheck',
          name: '多选框',
          label: '多选框',
          placeholder: '请选择',
          required: false,
          options: [
            { label: '选项1', value: '1' },
            { label: '选项2', value: '2' },
          ],
          defaultValue: [],
          optionTile: false, // 选项平铺
        },
        {
          id: '',
          type: FormComponentType.DATE,
          icon: 'Calendar',
          name: '日期选择',
          label: '日期选择',
          placeholder: '请选择',
          required: false,
          dateType: 'date',
          defaultValue: '',
        },
        {
          id: '',
          type: FormComponentType.DATERANGE,
          icon: 'Calendar',
          name: '日期区间',
          label: '日期区间',
          startLabel: '开始时间',
          endLabel: '结束时间',
          placeholder: '请选择',
          dateType: 'date',
          required: false,
          defaultValue: {
            startDate: '',
            endDate: '',
          },
        },
        {
          id: '',
          type: FormComponentType.IDCARD,
          icon: 'User',
          name: '身份证',
          label: '身份证',
          placeholder: '请输入',
          required: false,
        },
        {
          id: '',
          type: FormComponentType.PHONE,
          icon: 'Iphone',
          name: '手机号',
          label: '手机号',
          placeholder: '请输入',
          required: false,
        },
      ],
    },
    {
      category: '高级组件',
      items: [
        {
          id: '',
          type: FormComponentType.UPLOAD,
          icon: 'Upload',
          name: '文件上传',
          label: '文件上传',
          required: false,
        },
        {
          id: '',
          type: FormComponentType.IMAGE,
          icon: 'Picture',
          name: '图片上传',
          label: '图片上传',
          required: false,
        },
      ],
    },
  ])

  // 设置视图模式
  const setViewMode = (mode) => {
    viewMode.value = mode
  }

  // 重置表单设计草稿数据
  // 注意：不重置 components 配置数据
  const resetFormDesign = () => {
    const defaults = createDefaultFormDesignState()
    formItems.value = [...defaults.formItems]
    activeItem.value = defaults.activeItem
    viewMode.value = defaults.viewMode
    errors.value = {}
  }

  // 加载表单设计数据（用于加载接口数据，全量覆盖）
  // 注意：这里不修改 viewMode，由页面/用户控制
  // 注意：建议在外层切换表单时先 reset，再调用该方法
  const loadFormDesign = (formDesignData) => {
    formItems.value = formDesignData?.formItems || []
    activeItem.value = null
    errors.value = {}
  }

  // 导出表单设计数据（用于预览/发布组装）
  const toFormDesignPayload = () => {
    return {
      formItems: [...formItems.value],
    }
  }

  // 克隆组件
  const cloneComponent = (component) => {
    const cloned = JSON.parse(JSON.stringify(component))
    cloned.id = generateUniqueId()

    return cloned
  }

  // 添加组件
  const addComponent = (component) => {
    formItems.value.push(cloneComponent(component))
  }

  // 在指定数组中递归查找目标组件所在的位置
  const findInArray = (arr, componentId) => {
    const index = arr.findIndex((item) => item.id === componentId)
    if (index !== -1) return { arr, index }

    for (const item of arr) {
      if (item.type === FormComponentType.COLUMNS && item.children) {
        const result = findInArray(item.children, componentId)
        if (result) return result
      }
    }
    return null
  }

  // 通过 ID 查找组件所在的数组和索引
  const findItemContext = (componentId) => {
    return findInArray(formItems.value, componentId)
  }

  // 递归更新组件和所有子组件的ID
  const updateComponentIds = (component) => {
    // 使用唯一ID生成器，确保复制时的ID唯一性
    component.id = generateUniqueId()

    // 如果是分栏容器，递归处理其中的子组件
    if (component.type === FormComponentType.COLUMNS && component.children) {
      for (const childComponent of component.children) {
        updateComponentIds(childComponent)
      }
    }
  }

  // 处理组件选择事件
  const handleSelectComponent = (component) => {
    activeItem.value = component
  }

  // 处理组件复制事件
  const handleCopyComponent = (componentId) => {
    // 查找组件所在的数组和位置索引
    const context = findItemContext(componentId)
    if (!context) return
    const { arr, index } = context

    // 深拷贝组件
    const newItem = JSON.parse(JSON.stringify(arr[index]))

    // 递归更新组件和所有子组件的ID
    updateComponentIds(newItem)

    // 将复制的组件插入到原组件后面
    arr.splice(index + 1, 0, newItem)
  }

  // 处理组件删除事件
  const handleDeleteComponent = (componentId) => {
    // 查找组件所在的数组和位置索引
    const context = findItemContext(componentId)
    if (!context) return
    const { arr, index } = context

    const removed = arr.splice(index, 1)[0]

    // 如果删除的是当前选中的组件，则取消选中
    if (activeItem.value?.id === removed.id) {
      activeItem.value = null
    }
  }

  return {
    formItems,
    activeItem,
    errors,
    components,
    viewMode,
    setViewMode,
    resetFormDesign,
    loadFormDesign,
    toFormDesignPayload,
    cloneComponent,
    addComponent,
    handleSelectComponent,
    handleCopyComponent,
    handleDeleteComponent,
  }
})
