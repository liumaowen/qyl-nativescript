<template>
  <StackLayout class="legal-modal">
    <ScrollView height="400">
      <StackLayout class="modal-content">
        <Label :text="title" class="modal-title" />

        <StackLayout class="legal-text">
          <Label text="用户协议" class="section-title" />
          <Label
            text="欢迎使用我们的视频应用。使用本应用即表示您同意遵守以下条款和条件..."
            class="legal-content"
            textWrap="true"
          />

          <Label text="隐私政策" class="section-title" />
          <Label
            text="我们重视您的隐私。本隐私政策说明了我们如何收集、使用和保护您的个人信息..."
            class="legal-content"
            textWrap="true"
          />

          <Label text="免责声明" class="section-title" />
          <Label
            text="本应用仅供娱乐和学习目的使用。我们不对视频内容的准确性或完整性承担责任..."
            class="legal-content"
            textWrap="true"
          />
        </StackLayout>
      </StackLayout>
    </ScrollView>

    <StackLayout orientation="horizontal" class="modal-buttons">
      <Button
        :text="$t('common.cancel', '取消')"
        class="cancel-button"
        @tap="onCancel"
      />
      <Button
        :text="$t('common.confirm', '同意')"
        class="confirm-button"
        @tap="onConfirm"
      />
    </StackLayout>
  </StackLayout>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { UserAnalytics } from '@/services/analytics.service';

// Props
interface Props {
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '法律条款'
});

// Emits
const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

// Methods
const onConfirm = () => {
  UserAnalytics.trackEvent('legal_terms_accepted');
  emit('confirm');
};

const onCancel = () => {
  UserAnalytics.trackEvent('legal_terms_rejected');
  emit('cancel');
};
</script>