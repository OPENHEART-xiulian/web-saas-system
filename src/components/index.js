import image from "@/components/image.vue";
import FormatInput from "@/components/format-input.vue";
import BottomSubmit from "@/components/bottom-submit";
import SearchForm from "@/components/search-form";
import WTable from "@/components/table";
import WTab from "@/components/tab";
import unit from '@/components/unit';
import SaasStore from "@/components/storeSelect";

import SaasTable from "@/components/table/index.js";
import SaasQuery from "@/components/query/index.js";
import SassQueryTable from "@/components/query-table/index.js";
import SaasPage from "@/components/pagination/index.js";
import SaasBread from "@/components/breadcrumb/index.js";
import SaasTab from "@/components/tab/index.js";
import SaasCatetab from "@/components/catetab/index.js";
import SaasTreeMenu from "@/components/treemenu/index.js";

import SaasButton from "@/components/button/index.js";
import SaasInput from "@/components/input/index.js";


export default (Vue) => {
    Vue.component("saas-table", SaasTable);
    Vue.component("saas-query", SaasQuery);
    Vue.component("saas-query-table", SassQueryTable);
    Vue.component("saas-page", SaasPage);
    Vue.component("saas-bread", SaasBread);
    Vue.component("saas-tab", SaasTab);
    Vue.component("saas-catetab", SaasCatetab);
    Vue.component("saas-tree-menu", SaasTreeMenu);
    Vue.component("saas-toggle-btn", SaasButton.ToggleBtn);
    Vue.component("saas-search-input", SaasInput.SaasSearchInput);
    
    Vue.component("my-img", image);
    Vue.component("format-input", FormatInput);
    Vue.component("bottom-submit", BottomSubmit);
    Vue.component("search-form", SearchForm);
    Vue.component("w-table", WTable);
    Vue.component("w-tab", WTab);
    Vue.component('my-unit', unit);
    Vue.component('saas-store-select', SaasStore);
}
