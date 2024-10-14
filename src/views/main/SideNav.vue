<template>
  <ul :class="['side-nav']">
    <template v-for="(item, index) in navList">
      <li 
        v-if="item.title && item.showNav"
        :key="index" 
        :class="['nav-item', 
          { 'menu-active': !iconMenu },
          { 'active': $route.matched[1].path.slice(1) === item.path }
        ]">
        <div class="item-title" @click="onSelect(item.path, item, true)" :id="item.path">
          <i :class="['iconfont ' + item.icon]"></i>
          <p v-if="!iconMenu" class="title">{{item.title}}</p>
        </div>
        <ul v-if="item.meta && item.meta.showChild" 
          :class="['child-list', { 'icon-child': iconMenu }]">
          <li v-if="iconMenu" class="child-item icon-title" :id="'parent_' + item.title">{{item.title}}</li>
          <template v-for="(cItem, cIndex) in item.children">
            <li 
              v-if="cItem.showNav"
              :key="cIndex" :class="['child-item', {'active': getActiveName === (item.path + '/' + cItem.path)}]"
              @click.stop="onSelect(item.path + '/' + cItem.path, cItem)"
              :id="item.path + '_' + cItem.path">
              <p class="title">{{cItem.title}}</p>
            </li>
          </template>
        </ul>
      </li>
    </template>
  </ul>
</template>

<script>
  import '@/styles/components/side-nav.less';
  // import routes from '@/router';
  export default {
    props: {
      iconMenu: {
        type: [Boolean, Object],
        default: false,
      },
      navList: {
        type: Array,
        default () {
          return []
        }
      }
    },
    data () {
      return {
        // navList: routes[0].children.slice(0),
      }
    },

    methods: {
      // // 验证当前路由是否有权限
      // checkPermiss (route) {
      //   console.log(route)
      //   let isValid = true;
      //   if (route.meta && route.meta.isPermiss) {
      //     isValid = this.$permission.checkPermiss(route.meta.menuCode);
      //   }
      //   return isValid;
      // },
      onSelect (name, route, isParent) {
        _hmt.push(['_setCustomVar', 1, route.title, name, 1]);
        _hmt.push(['_trackEvent', route.title, '导航点击', name]);
        // console.log(name, route)
        // this.activeName = this.getActiveName;
        let arr = [];
        for (const key in this.$route.query) {
          const v = this.$route.query[key];
          arr.push(key + '=' + v);
        }
        let str = ''; // 路由后面的参数
        let reg = new RegExp(name);
        let eq = reg.test(this.$route.path);
        
        if (arr.length > 0 && eq) str = '?' + arr.join('&');
        
        // let path = '/' + name;
        // 点击父级的时候，如果没有权限就跳过到下一个菜单
        if (isParent && route && route.children && route.children.length > 0 && route.meta.showChild) {
          for (let i = 0; i < route.children.length; i++) {
            const item = route.children[i];
            // 没有权限验证的 或 显示导航的 就直接跳到该路由
            if (item.meta && (!item.meta.isPermiss || item.showNav)) {
              this.$router.push('/' + name + '/' + item.path + str);
              return;
            }
          }
        }
        this.$router.push('/' + name + str);
      },

      // getActiveName () {
      //   const matched = this.$route.matched;
      //   if (!matched[1].meta.showChild) {
      //     return matched[1].path.slice(1);
      //   } else {
      //     return matched[2].path.slice(1);
      //   }
      // }
    },
    computed: {
      getActiveName () {
        const matched = this.$route.matched;
        if (!matched[1].meta.showChild) {
          return matched[1].path.slice(1);
        } else {
          if (matched[2].path.slice(1) === 'inventory/refund') {
            return 'inventory/purchase';
          } else {
            return matched[2].path.slice(1);
          }
        }
      }
    }
  }
</script>
