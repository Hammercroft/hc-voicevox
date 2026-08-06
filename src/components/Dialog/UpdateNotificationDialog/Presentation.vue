<!-----------------------------------------------------------------------------

This file is a modified version of code from VOICEVOX
(https://github.com/VOICEVOX/voicevox), Copyright Hiroshiba Kazuyuki,
licensed under the GNU Lesser General Public License v3.

Modifications Copyright (C) 2026 Hammercroft.
Changed:
 - Swapped user-readable Japanese text with string lookups by localization key
 - Added extra text reminding users to use a translator for the changelogs

------------------------------------------------------------------------------>
<template>
  <QDialog v-model="dialogOpened">
    <QCard class="q-py-sm q-px-md dialog-card">
      <QCardSection>
        <!--<div class="text-h5">アップデートのお知らせ</div>-->
        <div class="text-h5">{{ t('update_notification_dialog.title') }}</div>
        <!--<div class="text-body2 text-grey-8">
          公式サイトから最新バージョンをダウンロードできます。
        </div>-->
        <div class="text-body2 text-grey-8">
          {{ t('update_notification_dialog.text1') }}
        </div>  
      </QCardSection>

      <QSeparator />

      <QCardSection class="q-py-none scroll scrollable-area">
        <template
          v-for="(info, infoIndex) of props.newUpdateInfos"
          :key="infoIndex"
        >
          <h3><!--バージョン-->{{ t('update_notification_dialog.text2') }} {{ info.version }}</h3>
          <ul>
            <template
              v-for="(item, descriptionIndex) of info.descriptions"
              :key="descriptionIndex"
            >
              <li>{{ item }}</li>
            </template>
          </ul>
          <small><em>{{ t('update_notification_dialog.hc_extra_text') }}</em></small>
        </template>
      </QCardSection>

      <QSeparator />

      <QCardActions>
        <QSpace />
        <QBtn
          padding="xs md"
          old_label="閉じる"
          :label="t('common_dialog.close_button')"
          unelevated
          color="surface"
          textColor="display"
          class="q-mt-sm"
          @click="closeUpdateNotificationDialog()"
        />
        <QBtn
          padding="xs md"
          old_label="このバージョンをスキップ"
          :label="t('update_notification_dialog.skip_this_version')"
          unelevated
          color="surface"
          textColor="display"
          class="q-mt-sm"
          @click="
            emit('skipThisVersionClick', props.latestVersion);
            closeUpdateNotificationDialog();
          "
        />
        <QBtn
          padding="xs md"
          old_label="公式サイトを開く"
          :label="t('update_notification_dialog.open_official_website')"
          unelevated
          color="primary"
          textColor="display-on-primary"
          class="q-mt-sm"
          @click="
            openOfficialWebsite();
            closeUpdateNotificationDialog();
          "
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import type { UpdateInfo } from "@/type/preload";
import { t } from '@/hc-strings'; // hc-voicevox string localization

const dialogOpened = defineModel<boolean>("dialogOpened", { default: false });
const props = defineProps<{
  /** 公開されている最新のバージョン */
  latestVersion: string;
  /** 表示するアップデート情報 */
  newUpdateInfos: UpdateInfo[];
}>();
const emit = defineEmits<{
  /** スキップするときに呼ばれる */
  (e: "skipThisVersionClick", version: string): void;
}>();

const closeUpdateNotificationDialog = () => {
  dialogOpened.value = false;
};

const openOfficialWebsite = () => {
  window.open(import.meta.env.VITE_OFFICIAL_WEBSITE_URL, "_blank");
};
</script>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.dialog-card {
  width: 700px;
  max-width: 80vw;
}

.scrollable-area {
  overflow-y: auto;
  max-height: 50vh;

  :deep() {
    h3 {
      font-size: 1.3rem;
      font-weight: bold;
      margin: 0;
    }
  }
}
</style>
