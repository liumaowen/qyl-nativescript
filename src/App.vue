<template>
  <Frame>
    <Page actionBarHidden="true">
      <TabView selectedIndex="1" @selectedIndexChange="onTabChange">

        <!-- Tab 2 -->
        <TabViewItem title="首页">
          <GridLayout>
            <Tab2Page />
          </GridLayout>
        </TabViewItem>

        <!-- Short Dramas -->
        <TabViewItem title="短剧">
          <GridLayout>
            <ShortDramasPage />
          </GridLayout>
        </TabViewItem>

        <!-- My -->
        <TabViewItem title="我的">
          <GridLayout>
            <MyPage />
          </GridLayout>
        </TabViewItem>

      </TabView>
    </Page>
  </Frame>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UserAnalytics } from '@/services/analytics.service';
import Tab1Page from '@/views/Tab1Page.vue';
import Tab2Page from '@/views/Tab2Page.vue';
import Tab3Page from '@/views/Tab3Page.vue';
import ShortDramasPage from '@/views/ShortDramasPage.vue';
import MyPage from '@/views/MyPage.vue';

const selectedTab = ref(1);

const onTabChange = (event: any) => {
  selectedTab.value = event.newIndex;

  const tabNames = ['tab1', 'tab2', 'tab3', 'shortDramas', 'my'];
  UserAnalytics.trackScreenView(tabNames[event.newIndex]);
};
</script>