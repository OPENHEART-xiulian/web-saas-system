<template>
  <div>
    <saas-bread title="消息"></saas-bread>
    <div class="notice-list">
      <Row>
          <i-col span="4">
            <ul class="left-menu">
              <li v-for="(item, index) in tabList"
                :key="index"
                @click="toLink(item.key)"
                :class="{ 'active': currentKey === item.key }">{{ item.name }}</li>
            </ul>
          </i-col>
          <i-col span="20">
            <w-table
              v-if="request"
              ref="table"
              :request="request"
              :columns="columns"
              :tableData="tableData"
              :showHeader="false">
            </w-table>
          </i-col>
      </Row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { formatTime } from '@/assets/js/utils';
import '@/styles/views/notice/list.less';

export default {
  data () {
    return {
      type: this.$route.params.type,
      currentKey: '',
      request: '',
      tabList: [
        { name: '版本消息', key: 'version' },
        { name: '公告消息', key: 'announce' }
      ],
      columns: [
        { 
          title: ' ', 
          key: 'title', 
          tooltip: true,
          className: 'notice-name',
          render: (h, { row }) => {
            return h('div', {
              style: {
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  this.$router.push('/notice/detail/' + this.currentKey + '/' + row._id);
                }
              }
            }, row.title)
          }
        },
        { 
          title: ' ', 
          key: 'publishAt', 
          width: 200,
          render: (h, { row }) => {
            return h('div', formatTime(row.publishAt, 'yyyy-MM-dd HH:mm:ss'));
          }
        }
      ]
    }
  },

  mounted () {
    this.currentKey = this.type;
    switch (this.type) {
      case 'version':
        this.request = 'versionnewsList';
        break;
      case 'announce':
        this.request = 'bulletinnewsList';
        break;
      default: 
        break;
    }
  },

  r () {

  },

  computed: {
    ...mapGetters({
      tableData: 'getTableData'
    })
  },

  methods: {
    toLink (key) {
      this.currentKey = key;
      switch (key) {
        case 'version':
          this.request = 'versionnewsList';
          this.$router.push('/notice/version');
          break;
        case 'announce':
          this.request = 'bulletinnewsList';
          this.$router.push('/notice/announce');
          break;
        default: 
          break;
      }

      setTimeout(() => {
        this.$refs.table.init();
      })
    }
  },
}
</script>
