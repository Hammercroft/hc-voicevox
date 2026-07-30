import { computed } from "vue";
import type { Store } from "@/store";
import { useRootMiscSetting } from "@/composables/useRootMiscSetting";
import type { ExportSongProjectFileType } from "@/store/type";
import { notifyResult } from "@/components/Dialog/Dialog";
import type {
  MaybeComputedMenuBarContent,
  MenuBarContent,
} from "@/components/Menu/MenuBar/menuBarData";
import { t } from '@/hc-strings'; // hc-voicevox string localization

export const useMenuBarData = (store: Store): MaybeComputedMenuBarContent => {
  const uiLocked = computed(() => store.getters.UI_LOCKED);
  const isNotesSelected = computed(
    () => store.getters.SELECTED_NOTE_IDS.size > 0,
  );

  const importExternalSongProject = async () => {
    if (uiLocked.value) return;
    await store.actions.SET_DIALOG_OPEN({
      isImportSongProjectDialogOpen: true,
    });
  };

  const exportAudioFile = async () => {
    if (uiLocked.value) return;
    await store.actions.SET_DIALOG_OPEN({
      isExportSongAudioDialogOpen: true,
    });
  };

  const exportSongProject = async (
    fileType: ExportSongProjectFileType,
    fileTypeLabel: string,
  ) => {
    if (uiLocked.value) return;
    const result = await store.actions.EXPORT_SONG_PROJECT({
      fileType,
      fileTypeLabel,
    });
    notifyResult(
      result,
      "project",
      store.actions,
      store.state.confirmedTips.notifyOnGenerate,
    );
  };

  const exportLabelFile = async () => {
    const results = await store.actions.EXPORT_LABEL_FILES({});

    if (results.length === 0) {
      throw new Error("results.length is 0.");
    }
    notifyResult(
      results[0], // TODO: SaveResultObject[] に対応する
      "label",
      store.actions,
      store.state.confirmedTips.notifyOnGenerate,
    );
  };

  // 「ファイル」メニュー
  const fileSubMenuData = computed<MenuBarContent["file"]>(() => ({
    audioExport: [
      {
        type: "button",
        //label: "音声書き出し",
        label: t("action.export_song"),
        onClick: () => {
          void exportAudioFile();
        },
        disableWhenUiLocked: true,
      },
      {
        type: "button",
        //label: "labファイルを書き出し",
        label: t("action.export_song_labels"),
        onClick: () => {
          void exportLabelFile();
        },
        disableWhenUiLocked: true,
      },
    ],
    externalProject: [
      {
        type: "button",
        //label: "プロジェクトをインポート",
        label: t("action.import_song_other"),
        onClick: () => {
          void importExternalSongProject();
        },
        disableWhenUiLocked: true,
      },
      {
        type: "root",
        //label: "プロジェクトをエクスポート",
        label: t("action.export_song_other"),
        subMenu: (
          [
            ["smf", "MIDI (SMF)"],
            ["musicxml", "MusicXML"],
            ["ufdata", "Utaformatix"],
            ["ust", "UTAU"],
          ] satisfies [fileType: ExportSongProjectFileType, label: string][]
        ).map(([fileType, label]) => ({
          type: "button",
          label,
          onClick: () => {
            void exportSongProject(fileType, label);
          },
          disableWhenUiLocked: true,
        })),
        disableWhenUiLocked: true,
      },
    ],
  }));

  // 「編集」メニュー
  const editSubMenuData = computed<MenuBarContent["edit"]>(() => ({
    copyPaste: [
      {
        type: "button",
        //label: "コピー",
        label: t("action.copy_notes"),
        onClick: () => {
          if (uiLocked.value) return;
          void store.actions.COPY_NOTES_TO_CLIPBOARD();
        },
        disableWhenUiLocked: true,
        disabled: !isNotesSelected.value,
      },
      {
        type: "button",
        //label: "切り取り",
        label: t("action.cut_notes"),
        onClick: () => {
          if (uiLocked.value) return;
          void store.actions.COMMAND_CUT_NOTES_TO_CLIPBOARD();
        },
        disableWhenUiLocked: true,
        disabled: !isNotesSelected.value,
      },
      {
        type: "button",
        //label: "貼り付け",
        label: t("action.paste_notes"),
        onClick: () => {
          if (uiLocked.value) return;
          void store.actions.COMMAND_PASTE_NOTES_FROM_CLIPBOARD();
        },
        disableWhenUiLocked: true,
      },
    ],
    select: [
      {
        type: "button",
        //label: "すべて選択",
        label: t("action.select_all_notes_in_track"),
        onClick: () => {
          if (uiLocked.value) return;
          void store.actions.SELECT_ALL_NOTES_IN_TRACK({
            trackId: store.getters.SELECTED_TRACK_ID,
          });
        },
        disableWhenUiLocked: true,
      },
      {
        type: "button",
        //label: "選択解除",
        label: t("action.deselect_all_notes"),
        onClick: () => {
          if (uiLocked.value) return;
          void store.actions.DESELECT_ALL_NOTES();
        },
        disableWhenUiLocked: true,
      },
    ],
    misc: [
      {
        type: "button",
        //label: "クオンタイズ",
        label: t("action.quantize_selected_notes"),
        onClick: () => {
          if (uiLocked.value) return;
          void store.actions.COMMAND_QUANTIZE_SELECTED_NOTES();
        },
        disableWhenUiLocked: true,
      },
    ],
  }));

  // 「表示」メニュー
  const [showSingCharacterPortrait, setShowSingCharacterPortrait] =
    useRootMiscSetting(store, "showSingCharacterPortrait");
  const viewSubMenuData = computed<MenuBarContent["view"]>(() => ({
    portrait: [
      {
        type: "button",
        label: showSingCharacterPortrait.value
          //? "立ち絵を非表示"
          //: "立ち絵を表示",
          ? t("action.hide_character_portrait")
          : t("action.show_character_portrait"),
        onClick: () => {
          setShowSingCharacterPortrait(!showSingCharacterPortrait.value);
        },
        disableWhenUiLocked: true,
      },
    ],
  }));

  return {
    file: fileSubMenuData,
    edit: editSubMenuData,
    view: viewSubMenuData,
  };
};
