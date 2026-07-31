import { computed, ref, watch } from "vue";
import type { MenuItemData } from "../type";
import type { MaybeComputedMenuBarContent } from "./menuBarData";
import { ensureNotNullish } from "@/type/utility";
import { useHotkeyManager, type HotkeyAction } from "@/plugins/hotkeyPlugin";
import type { Store } from "@/store";
import { isProduction } from "@/helpers/platform";
import { t } from '@/hc-strings'; // hc-voicevox string localization

export const useCommonMenuBarData = (store: Store) => {
  const uiLocked = computed(() => store.getters.UI_LOCKED);

  const editor = computed(() => store.state.openedEditor);
  const canUndo = computed(
    () => editor.value && store.getters.CAN_UNDO(editor.value),
  );
  const canRedo = computed(
    () => editor.value && store.getters.CAN_REDO(editor.value),
  );

  const isMultiSelectEnabled = computed(() => store.state.enableMultiSelect);

  const audioKeys = computed(() => store.state.audioKeys);

  const createNewProject = async () => {
    if (!uiLocked.value) {
      await store.actions.CREATE_NEW_PROJECT({});
    }
  };

  const saveProject = async () => {
    if (!uiLocked.value) {
      await store.actions.SAVE_PROJECT_FILE_OVERWRITE();
    }
  };

  const saveProjectAs = async () => {
    if (!uiLocked.value) {
      await store.actions.SAVE_PROJECT_FILE_AS();
    }
  };

  const saveProjectCopy = async () => {
    if (!uiLocked.value) {
      await store.actions.SAVE_PROJECT_FILE_AS_COPY();
    }
  };

  const importProject = () => {
    if (!uiLocked.value) {
      void store.actions.LOAD_PROJECT_FILE({ type: "dialog" });
    }
  };

  /** UIの拡大 */
  const zoomIn = async () => {
    await store.actions.ZOOM_IN();
  };

  /** UIの縮小 */
  const zoomOut = async () => {
    await store.actions.ZOOM_OUT();
  };

  /** UIの拡大率リセット */
  const zoomReset = async () => {
    await store.actions.ZOOM_RESET();
  };

  const toggleFullScreen = async () => {
    window.backend.toggleFullScreen();
  };

  // 「最近使ったプロジェクト」のメニュー
  const recentProjectsSubMenuData = ref<MenuItemData[]>([]);
  const updateRecentProjects = async () => {
    const recentlyUsedProjects =
      await store.actions.GET_RECENTLY_USED_PROJECTS();
    recentProjectsSubMenuData.value =
      recentlyUsedProjects.length === 0
        ? [
            {
              type: "button",
              //label: "最近使ったプロジェクトはありません",
              label: t("recent_projects.no_recent_projects"),
              onClick: () => {
                // 何もしない
              },
              disabled: true,
              disableWhenUiLocked: false,
            },
          ]
        : recentlyUsedProjects.map((projectFilePath) => ({
            type: "button",
            label: projectFilePath,
            onClick: () => {
              void store.actions.LOAD_PROJECT_FILE({
                type: "path",
                filePath: projectFilePath,
              });
            },
            disableWhenUiLocked: false,
          }));
  };
  const projectFilePath = computed(() => store.state.projectFilePath);
  watch(projectFilePath, updateRecentProjects, {
    immediate: true,
  });

  // TODO: 本来はこのファイルにホットキーの登録を書くべきではないので、どこかに移す。
  const { registerHotkeyWithCleanup } = useHotkeyManager();
  /**
   * 全エディタに対してホットキーを登録する
   * FIXME: hotkeyPlugin側で全エディタに対して登録できるようにする
   */
  function registerHotkeyForAllEditors(action: Omit<HotkeyAction, "editor">) {
    registerHotkeyWithCleanup({
      editor: "talk",
      ...action,
    });
    registerHotkeyWithCleanup({
      editor: "song",
      ...action,
    });
  }

  registerHotkeyForAllEditors({
    callback: createNewProject,
    name: "新規プロジェクト",
  });
  registerHotkeyForAllEditors({
    callback: saveProject,
    name: "プロジェクトを上書き保存",
  });
  registerHotkeyForAllEditors({
    callback: saveProjectAs,
    name: "プロジェクトを名前を付けて保存",
  });
  registerHotkeyForAllEditors({
    callback: saveProjectCopy,
    name: "プロジェクトの複製を保存",
  });
  registerHotkeyForAllEditors({
    callback: importProject,
    name: "プロジェクトを読み込む",
  });
  registerHotkeyForAllEditors({
    callback: toggleFullScreen,
    name: "全画面表示を切り替え",
  });
  registerHotkeyForAllEditors({
    callback: zoomIn,
    name: "拡大",
  });
  registerHotkeyForAllEditors({
    callback: zoomOut,
    name: "縮小",
  });
  registerHotkeyForAllEditors({
    callback: zoomReset,
    name: "拡大率のリセット",
  });

  return computed<MaybeComputedMenuBarContent>(() => ({
    file: {
      project: [
        {
          type: "button",
          //label: "新規プロジェクト",
          label: t("action.create_new_project"),
          onClick: createNewProject,
          disableWhenUiLocked: true,
        },
        {
          type: "button",
          //label: "プロジェクトを上書き保存",
          label: t("action.save_project"),
          onClick: async () => {
            await saveProject();
          },
          disableWhenUiLocked: true,
        },
        {
          type: "button",
          //label: "プロジェクトを名前を付けて保存",
          label: t("action.save_project_as"),
          onClick: async () => {
            await saveProjectAs();
          },
          disableWhenUiLocked: true,
        },
        {
          type: "button",
          //label: "プロジェクトの複製を保存",
          label: t("action.save_project_copy"),
          onClick: async () => {
            await saveProjectCopy();
          },
          disableWhenUiLocked: true,
        },
        {
          type: "button",
          //label: "プロジェクトを読み込む",
          label: t("action.open_project"),
          onClick: () => {
            importProject();
          },
          disableWhenUiLocked: true,
        },
        {
          type: "root",
          //label: "最近使ったプロジェクト",
          label: t("recent_projects.menu_label"),
          disableWhenUiLocked: true,
          subMenu: recentProjectsSubMenuData.value,
        },
      ],
    },

    edit: {
      undoRedo: [
        {
          type: "button",
          //label: "元に戻す",
          label: t("action.undo"),
          onClick: async () => {
            if (!uiLocked.value) {
              await store.actions.UNDO({
                editor: ensureNotNullish(editor.value),
              });
            }
          },
          disabled: !canUndo.value,
          disableWhenUiLocked: true,
        },
        {
          type: "button",
          //label: "やり直す",
          label: t("action.redo"),
          onClick: async () => {
            if (!uiLocked.value) {
              await store.actions.REDO({
                editor: ensureNotNullish(editor.value),
              });
            }
          },
          disabled: !canRedo.value,
          disableWhenUiLocked: true,
        },
        ...(isMultiSelectEnabled.value
          ? [
              {
                type: "button",
                //label: "すべて選択",
                label: t("action.select_all"),
                onClick: async () => {
                  if (!uiLocked.value && isMultiSelectEnabled.value) {
                    await store.actions.SET_SELECTED_AUDIO_KEYS({
                      audioKeys: audioKeys.value,
                    });
                  }
                },
                disableWhenUiLocked: true,
              } as const,
            ]
          : []),
      ],
    },

    view: {
      window: [
        {
          type: "button",
          //label: "全画面表示を切り替え",
          label: t("action.toggle_fullscreen"),
          onClick: toggleFullScreen,
          disableWhenUiLocked: false,
        },
        {
          type: "button",
          //label: "拡大",
          label: t("action.zoom_in"),
          onClick: () => {
            void zoomIn();
          },
          disableWhenUiLocked: false,
        },
        {
          type: "button",
          //label: "縮小",
          label: t("action.zoom_out"),
          onClick: () => {
            void zoomOut();
          },
          disableWhenUiLocked: false,
        },
        {
          type: "button",
          //label: "拡大率のリセット",
          label: t("action.zoom_reset"),
          onClick: () => {
            void zoomReset();
          },
          disableWhenUiLocked: false,
        },
      ],
    },

    setting: {
      subOptions: [
        {
          type: "button",
          //label: "キー割り当て",
          label: t("hotkeys.menu_label"),
          onClick() {
            void store.actions.SET_DIALOG_OPEN({
              isHotkeySettingDialogOpen: true,
            });
          },
          disableWhenUiLocked: false,
        },
        {
          type: "button",
          //label: "ツールバーのカスタマイズ",
          label: t("toolbar_settings.menu_label"),
          onClick() {
            void store.actions.SET_DIALOG_OPEN({
              isToolbarSettingDialogOpen: true,
            });
          },
          disableWhenUiLocked: false,
        },
        ...(!isProduction
          ? [
              {
                type: "button",
                //label: "キャラクター＆スタイルの管理",
                label: t("character_list.menu_label"),
                onClick() {
                  void store.actions.SET_DIALOG_OPEN({
                    isCharacterListDialogOpen: true,
                  });
                },
                disableWhenUiLocked: true,
              } as const,
            ]
          : []),
        {
          type: "button",
          //label: "キャラクター並び替え・試聴",
          label: t("legacy_character_list.menu_label"),
          onClick() {
            void store.actions.SET_DIALOG_OPEN({
              isOldCharacterOrderDialogOpen: true,
            });
          },
          disableWhenUiLocked: true,
        },
        {
          type: "button",
          //label: "デフォルトスタイル",
          label: t("legacy_default_style_menu.menu_label"),
          onClick() {
            void store.actions.SET_DIALOG_OPEN({
              isOldDefaultStyleSelectDialogOpen: true,
            });
          },
          disableWhenUiLocked: true,
        },
        {
          type: "button",
          //label: "読み方＆アクセント辞書",
          label: t("dictionary.menu_label"),
          onClick() {
            void store.actions.SET_DIALOG_OPEN({
              isDictionaryManageDialogOpen: true,
            });
          },
          disableWhenUiLocked: true,
        },
      ],
      options: [
        {
          type: "button",
          //label: "オプション",
          label: t("configuration.menu_label"),
          onClick() {
            void store.actions.SET_DIALOG_OPEN({
              isSettingDialogOpen: true,
            });
          },
          disableWhenUiLocked: false,
        },
      ],
    },
  }));
};
