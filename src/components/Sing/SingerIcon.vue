<!-----------------------------------------------------------------------------

This file is a modified version of code from VOICEVOX
(https://github.com/VOICEVOX/voicevox), Copyright Hiroshiba Kazuyuki,
licensed under the GNU Lesser General Public License v3.

Modifications Copyright (C) 2026 Hammercroft.
Changed:
 - Modified engine-icon style rule

------------------------------------------------------------------------------>

<template>
  <QAvatar size="3rem" v-bind="attr">
    <QImg noSpinner noTransition :ratio="1" :src="props.style.iconPath" />
    <QAvatar v-if="props.showEngineIcon" rounded class="engine-icon">
      <img :src="props.engineIcons[props.style.engineId]" />
    </QAvatar>
  </QAvatar>
</template>

<script setup lang="ts">
import { useAttrs } from "vue";
import type { EngineId, StyleInfo } from "@/type/preload";

const attr = useAttrs();
const props = withDefaults(
  defineProps<{
    style: StyleInfo;
    showEngineIcon?: boolean;
    engineIcons?: Record<EngineId, string>;
  }>(),
  {
    showEngineIcon: false,
    engineIcons: () => ({}),
  },
);
</script>

<style scoped lang="scss">
.engine-icon {
  position: absolute;
  width: 32px;
  height: 32px;
  bottom: -2px;
  right: -2px;
}
</style>
