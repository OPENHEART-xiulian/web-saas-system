<template>
  <div>
    <saas-bread title="消息">
      <template slot="actions">
        <Button @click="back" type="default">返回</Button>
      </template>
    </saas-bread>
    <div class="notice-detail">
      <h1>{{ noticeDetail.title }}</h1>
      <p class="time">{{ noticeDetail.publishAt }}</p>
      <div class="content" v-html="noticeDetail.description"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { formatTime } from '@/assets/js/utils';
import '@/styles/views/notice/detail.less';
export default {
  data () {
    return {
      id: this.$route.params.id,
      type: this.$route.params.type
    }
  },

  mounted () {
    const payload = {
      params: {
        newsId: this.id
      },
      type: this.type
    }
    this.$store.dispatch({
      type: 'toGetNoticeDetail',
      payload
    })
  },

  computed: {
    ...mapGetters({
      noticeDetail: 'getNoticeDetail'
    })
  },

  watch: {
    noticeDetail (value) {
      if (value) {
        value.publishAt = formatTime(value.publishAt, 'yyyy-MM-dd HH:mm:ss');
      }
    }
  },

  methods: {
    back () {
      this.$router.go(-1);
    }
  },
}
</script>
