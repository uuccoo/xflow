<template>
  <div>
    <el-form-item label="栏目布局">
      <el-select v-model="component.layoutValue" @change="updateColumnsLayout" style="width: 100%">
        <el-option label="两等分" value="1:1"></el-option>
        <el-option label="三等分" value="1:1:1"></el-option>
      </el-select>
    </el-form-item>
  </div>
</template>

<script setup>
import { useFormDesignStore } from '../../../../stores/formDesignStore';

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
});

const formStore = useFormDesignStore();

const updateColumnsLayout = () => {
  formStore.updateColumnsLayout(props.component.layoutValue);
};
</script>