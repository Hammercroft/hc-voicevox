<!--
This file is a modified version of code from VOICEVOX
(https://github.com/VOICEVOX/voicevox), Copyright Hiroshiba Kazuyuki,
licensed under the GNU Lesser General Public License v3.

Modifications Copyright (C) 2026 Hammercroft.
Changed:
 - Swapped user-readable Japanese text with string lookups by localization key
 - Added VOICEVOX_NOTICE, an entry shown before entries listed in public/licenses.json
-->

<template>
  <div v-if="detailIndex == undefined" class="container">
    <BaseScrollArea>
      <div class="inner inner-list">
        <h1 class="title"><!--ライセンス情報-->{{ t("app_license_page.title") }}</h1>
        <div class="list">
          <BaseRowCard
            v-for="(license, index) in licensesWithNotice"
            :key="index"
            :title="
              license.name + (license.version ? ' | ' + license.version : '')
            "
            clickable
            @click="selectLicenseIndex(index)"
          >
            <!-- 暫定でq-iconを使用 -->
            <QIcon name="keyboard_arrow_right" size="sm" />
          </BaseRowCard>
        </div>
      </div>
    </BaseScrollArea>
  </div>
  <div v-else class="container">
    <BaseScrollArea>
      <div class="inner">
        <div>
          <BaseButton
            label="戻る"
            icon="keyboard_arrow_left"
            @click="selectLicenseIndex(undefined)"
          />
        </div>
        <h1 class="title">{{ licensesWithNotice[detailIndex].name }}</h1>
        <pre>{{ licensesWithNotice[detailIndex].text }}</pre>
      </div>
    </BaseScrollArea>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import BaseRowCard from "@/components/Base/BaseRowCard.vue";
import BaseButton from "@/components/Base/BaseButton.vue";
import BaseScrollArea from "@/components/Base/BaseScrollArea.vue";
import type { OssLicenseInfo } from "@/domain/staticAssets";
import {t} from "@/hc-strings";

const props = defineProps<{
  licenses: OssLicenseInfo[];
}>();

// License & copyright notice for the VOICEVOX app itself
// The LGPLv3 requires this text to be present in the Combined Work -- all binary builds of VOICEVOX.
const VOICEVOX_NOTICE: OssLicenseInfo = {
  name: "VOICEVOX (hc-voicevox)",
  version: undefined,
  license: "LGPL-3.0",
  text:
    "This software is a modified version of VOICEVOX (https://github.com/VOICEVOX/voicevox).\n" +
    "Copyright Hiroshiba Kazuyuki, licensed under the GNU Lesser General Public License v3.0.\n\n" +
    "Modifications in this fork are Copyright (C) 2026 Hammercroft.\n" +
    "This is an unofficial, independently modified derivative and is not endorsed by\n" +
    "or affiliated with the original VOICEVOX project or Hiroshiba Kazuyuki.\n\n" +
    "See LGPL_LICENSE in the app files for the full license text.",
};

const licensesWithNotice = computed<OssLicenseInfo[]>(() => [
  VOICEVOX_NOTICE,
  ...props.licenses,
]);

const detailIndex = ref<number | undefined>(undefined);

const selectLicenseIndex = (index: number | undefined) => {
  detailIndex.value = index;
};

</script>

<style scoped lang="scss">
@use "@/styles/v2/variables" as vars;
@use "@/styles/v2/mixin" as mixin;
@use "@/styles/v2/colors" as colors;

.container {
  height: 100%;
}

.inner {
  display: flex;
  flex-direction: column;
  padding: vars.$padding-2;
  gap: vars.$gap-1;
  max-width: 960px;
  margin: auto;
}

.title {
  @include mixin.headline-1;
}

.list {
  display: flex;
  flex-direction: column;
  gap: vars.$gap-1;
}
</style>
