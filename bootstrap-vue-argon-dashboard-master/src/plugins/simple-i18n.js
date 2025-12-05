import Vue from 'vue';
import translations from '@/i18n/translations';

export default {
  install(VueInstance, options = {}) {
    const defaultLocale = options.default || 'vi';

    // reactive state so changes trigger re-render
    const state = Vue.observable({
      locale: defaultLocale,
      translations
    });

    // expose reactive i18n object
    VueInstance.prototype.$i18n = state;

    // helper for backward-compatibility
    VueInstance.prototype.$locale = state.locale;

    VueInstance.prototype.$setLocale = function (loc) {
      if (!state.translations[loc]) return;
      state.locale = loc;
      VueInstance.prototype.$locale = loc;
      // emit an event (optional) for older listeners
      this.$root && this.$root.$emit && this.$root.$emit('locale-changed', loc);
    };

    VueInstance.prototype.$t = function (key) {
      const loc = state.locale || 'vi';
      const dict = state.translations[loc] || {};
      return dict[key] != null ? dict[key] : key;
    };
  }
};
