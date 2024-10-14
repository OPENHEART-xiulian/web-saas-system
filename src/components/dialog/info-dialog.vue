<template>
  <Modal v-model="modal" 
    class="w-dialog info-dialog"
    :closable="false"
    width="800">
    <p><Icon type="help-circled"></Icon>维修类别选择说明</p>
    <p>维修类别，以GB/T 5624中规定的汽车维护类别和汽车修理类别为准，应包括：日常维护、一级维护、二级维护、汽车大修、汽车小修、总成修理及零件修理。其中，乘用车的定期保养应归为一级维护</p>
    <p>① 日常维护：以清洁、补给和安全性能检视为中心内容的维护作业。</p>
    <p>② 一级维护：除日常维护作业外，以润滑、紧固为作业中心内容，并检查有关制动、操纵等系统中的安全部件的维护作业。</p>
    <p>③ 二级维护：除一级维护作业外以检查、调整制动系、转向操纵系、悬架等安全部件、拆检轮胎、进行轮胎换位</p>
    <p>④ 汽车大修：通过修复或更换汽车零部件(包括基础件)，恢复汽车完好技术状况和完全(或接近完全)恢复汽车寿命的修理。</p>
    <p>⑤ 汽车小修：通过修理或更换个别零件，消除车辆在运行过程或维护过程中发生或发现的故障或隐患，恢复汽车工作能力的作业。</p>
    <p>⑥ 总成修理：为恢复汽车总成完好技术状况(或工作能力)和寿命而进行的作业。</p>
    <p>⑦ 零件修理：恢复汽车零件性能和寿命的作业。</p>
    <div slot="footer">
      <Button type="error" size="large" @click.native.stop="onCancel">知道了</Button>
    </div>
  </Modal>
</template>

<script>
import mixins from './dialog.mixin.js';

export default {
  mixins: [mixins]
}
</script>
