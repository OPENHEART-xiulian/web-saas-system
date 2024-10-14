<template>
  <Modal 
    :title="title" 
    v-model="modal"
    width="700px" 
    @on-cancel="closeModal"
    class="w-dialog versions-dialog">
    <div class="title">{{versions.title}}</div>
    <p class="description" v-html="versions.description"></p>
    <div slot="footer">
      <i-button type="error" @click="closeModal">我知道啦</i-button>
    </div>
  </Modal>
</template>

<script>
  export default {
    props: {
      title: String
    },
    data () {
      return {
        modal: false,
        versions: {
          title: '',
          description: '',
        }
      }
    },
    methods: {
      openModal (data) {
        // this.versions = data;
        this.versions.title = data.title;
        this.versions.description = data.description;
        this.modal = true; 
      },
      closeModal () {
        this.modal = false;
        this.$emit("on-cancel");
      }
    }
  }
</script>
