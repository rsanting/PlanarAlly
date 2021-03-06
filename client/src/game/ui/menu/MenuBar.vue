<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { mapState } from "vuex";

import ColorPicker from "@/core/components/colorpicker.vue";
import { baseAdjust, uuidv4 } from "@/core/utils";
import { layerManager } from "@/game/layers/manager";
import { Note } from "@/game/models/general";
import { gameStore } from "@/game/store";
import AssetNode from "@/game/ui/menu/AssetNode.vue";
import NoteDialog from "@/game/ui/NoteDialog.vue";

import { AssetList } from "../../../core/models/types";
import UI from "../ui.vue";

@Component({
    components: {
        "color-picker": ColorPicker,
        "asset-node": AssetNode,
        NoteDialog,
    },
    computed: {
        ...mapState("game", ["assets", "notes", "markers"]),
    },
})
export default class MenuBar extends Vue {
    assets!: AssetList;
    markers!: string[];
    notes!: Note[];

    $refs!: {
        note: NoteDialog;
    };
    $parent!: UI;

    assetSearch = "";

    baseAdjust(path: string): string {
        return baseAdjust(path);
    }

    get IS_DM(): boolean {
        return gameStore.IS_DM || gameStore.FAKE_PLAYER;
    }

    settingsClick(event: { target: HTMLElement }): void {
        if (
            event.target.classList.contains("menu-accordion") &&
            event.target.nextElementSibling?.classList.contains("menu-accordion-panel")
        ) {
            event.target.classList.toggle("menu-accordion-active");
        }
    }
    createNote(): void {
        const note = { title: this.$t("game.ui.menu.MenuBar.new_note").toString(), text: "", uuid: uuidv4() };
        gameStore.newNote({ note, sync: true });
        this.openNote(note);
    }
    openNote(note: Note): void {
        this.$refs.note.open(note);
    }

    openDmSettings(): void {
        this.$parent.$refs.dmsettings.open();
    }

    openUserSettings(): void {
        this.$parent.$refs.clientsettings.open();
    }

    delMarker(marker: string): void {
        gameStore.removeMarker({ marker: marker, sync: true });
    }

    jumpToMarker(marker: string): void {
        gameStore.jumpToMarker(marker);
    }

    nameMarker(marker: string): string {
        const shape = layerManager.UUIDMap.get(marker);
        if (shape !== undefined) {
            return shape.name;
        } else {
            return "";
        }
    }
}
</script>

<template>
    <!-- SETTINGS -->
    <div id="menu" @click="settingsClick" ref="settings">
        <NoteDialog ref="note"></NoteDialog>
        <div style="width: 200px; overflow-y: auto; overflow-x: hidden">
            <!-- ASSETS -->
            <template v-if="IS_DM">
                <button class="menu-accordion" v-t="'common.assets'"></button>
                <div id="menu-assets" class="menu-accordion-panel">
                    <input id="asset-search" v-model="assetSearch" :placeholder="$t('common.search')" />
                    <a
                        class="actionButton"
                        :href="baseAdjust('/assets')"
                        target="blank"
                        :title="$t('game.ui.menu.MenuBar.open_asset_manager')"
                    >
                        <font-awesome-icon icon="external-link-alt" />
                    </a>
                    <div class="directory" id="menu-tokens">
                        <asset-node :asset="assets" :search="assetSearch"></asset-node>
                        <div v-if="Object.keys(assets).length === 1 && assets['__files'].length <= 0">
                            {{ $t("game.ui.menu.MenuBar.no_assets") }}
                        </div>
                    </div>
                </div>
                <!-- NOTES -->
                <button class="menu-accordion" v-t="'common.notes'"></button>
                <div class="menu-accordion-panel">
                    <div class="menu-accordion-subpanel" id="menu-notes">
                        <a class="actionButton" @click="createNote" :title="$t('game.ui.menu.MenuBar.create_note')">
                            <font-awesome-icon icon="plus-square" />
                        </a>
                        <div v-for="note in notes" :key="note.uuid" @click="openNote(note)" style="cursor: pointer">
                            {{ note.title || "[?]" }}
                        </div>
                        <div v-if="!notes.length" v-t="'game.ui.menu.MenuBar.no_notes'"></div>
                    </div>
                </div>
                <!-- DM OPTIONS -->
                <button class="menu-accordion" @click="openDmSettings" v-t="'game.ui.menu.MenuBar.dm_options'"></button>
            </template>
            <!-- MARKERS -->
            <button class="menu-accordion" v-t="'common.markers'"></button>
            <div class="menu-accordion-panel">
                <div class="menu-accordion-subpanel" id="menu-markers">
                    <div v-for="marker in markers" :key="marker" style="cursor: pointer">
                        <div @click="jumpToMarker(marker)" class="menu-accordion-subpanel-text">
                            {{ nameMarker(marker) || "[?]" }}
                        </div>
                        <div @click="delMarker(marker)" :title="$t('game.ui.menu.MenuBar.delete_marker')">
                            <font-awesome-icon icon="minus-square" />
                        </div>
                    </div>
                    <div v-if="!markers.length" v-t="'game.ui.menu.MenuBar.no_markers'"></div>
                </div>
            </div>
            <!-- CLIENT OPTIONS -->
            <button
                class="menu-accordion"
                @click="openUserSettings"
                v-t="'game.ui.menu.MenuBar.client_options'"
            ></button>
        </div>
        <router-link
            to="/dashboard"
            class="menu-accordion"
            style="width: 200px; box-sizing: border-box; text-decoration: none; display: inline-block"
        >
            {{ $t("common.exit") }}
        </router-link>
    </div>
</template>

<style scoped lang="scss">
.menu-accordion-active + #menu-assets {
    display: flex;
    flex-direction: column;
}

#asset-search {
    text-align: center;

    &::placeholder {
        text-align: center;
    }
}

/*
DIRECTORY.CSS changes

* Collapse all folders by default, use js to toggle visibility on click.
* On hover over folder show some visual feedback
* On hover over file show the image

*/
.folder {
    > * {
        display: none;
    }

    &:hover {
        font-weight: bold;
        cursor: pointer;
    }

    &:hover > * {
        font-weight: normal;
    }
}

.directory > .folder,
.directory > .file {
    display: block;
}

#menuContainer {
    position: absolute;
    z-index: 20;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    pointer-events: none;
}

#menu {
    grid-area: menu;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: #fa5a5a;
    overflow: auto;
    pointer-events: auto;
    max-width: 200px;
}

.actionButton {
    margin: 5px;
    align-self: flex-end;
    margin-bottom: -30px;
    z-index: 11;
}

.menu-accordion {
    background-color: #eee;
    color: #444;
    cursor: pointer;
    padding: 18px;
    text-align: left;
    border: none;
    outline: none;
    transition: 0.4s;
    border-top: solid 1px #82c8a0;
    width: 100%;
    width: -moz-available;
    width: -webkit-fill-available;
    width: stretch;
}

.menu-accordion-active,
.menu-accordion:hover {
    background-color: #82c8a0;
}

.menu-accordion-panel {
    background-color: white;
    display: none;
    overflow: hidden;
    min-height: 2em;
}

.menu-accordion-active + .menu-accordion-panel {
    display: block;
}

.menu-accordion-subpanel {
    display: flex;
    flex-direction: column;
    width: 100%;

    > * {
        padding: 5px;
        display: flex;
        justify-content: space-evenly;
        align-items: center;

        &:hover {
            background-color: #82c8a0;
        }
    }
}

.menu-accordion-subpanel-text {
    text-align: left;
    justify-content: flex-start;
    flex: 1;
}
</style>
