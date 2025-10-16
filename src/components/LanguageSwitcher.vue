<template>
  <StackLayout class="language-switcher">
    <Label
      text="🌍 选择语言"
      class="switcher-title"
    />

    <StackLayout
      v-for="language in supportedLanguages"
      :key="language.code"
      class="language-option"
      @tap="() => selectLanguage(language.code)"
    >
      <StackLayout
        orientation="horizontal"
        class="language-row"
      >
        <Label
          :text="language.name"
          class="language-name"
        />
        <Label
          v-if="currentLanguage === language.code"
          text="✓"
          class="language-check"
        />
      </StackLayout>
    </StackLayout>
  </StackLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { LocalizationService } from '@/services/localization.service';
import { UserAnalytics } from '@/services/analytics.service';

// State
const currentLanguage = ref('zh-CN');
const supportedLanguages = ref<Array<{code: string, name: string}>>([]);

// Methods
const loadLanguages = () => {
  supportedLanguages.value = LocalizationService.getSupportedLanguages();
  currentLanguage.value = LocalizationService.getCurrentLanguage();
};

const selectLanguage = async (languageCode: string) => {
  if (currentLanguage.value !== languageCode) {
    await LocalizationService.setLanguage(languageCode);
    currentLanguage.value = languageCode;

    UserAnalytics.trackEvent('language_changed', {
      newLanguage: languageCode,
      previousLanguage: currentLanguage.value
    });

    // 提示用户重启应用以完全应用语言更改
    console.log('语言已更改，建议重启应用');
  }
};

// Lifecycle
onMounted(() => {
  loadLanguages();
});
</script>