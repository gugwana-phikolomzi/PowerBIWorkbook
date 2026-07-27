"use strict";

import "./components/style.less";

import { renderHeader } from "./components/header";
import { renderPivotTable } from "./components/pivotTable";

import {
    AnalyticsField,
    buildFieldsFromMetadata,
    renderFieldsPanel,
} from "./components/fieldsPanel";

import {
    createEmptyFieldWellsState,
    DraggedWellField,
    FieldWellId,
    FieldWellsState,
    renderFieldWells,
} from "./components/fieldWells";

import powerbi from "powerbi-visuals-api";

import IVisual =
    powerbi.extensibility.visual.IVisual;

import VisualConstructorOptions =
    powerbi.extensibility.visual.VisualConstructorOptions;

import VisualUpdateOptions =
    powerbi.extensibility.visual.VisualUpdateOptions;

import DataView =
    powerbi.DataView;

export class Visual implements IVisual {
    private readonly hostElement: HTMLElement;
    private readonly root: HTMLDivElement;

    private dataView?: DataView;
    private availableFields: AnalyticsField[] = [];

    private draggedField?: AnalyticsField;
    private draggedWellField?: DraggedWellField;

    private fieldWellsState: FieldWellsState =
        createEmptyFieldWellsState();

    constructor(options: VisualConstructorOptions) {
        this.hostElement = options.element;

        this.hostElement.replaceChildren();

        this.root =
            document.createElement("div");

        this.root.className =
            "pivot-wireframe";

        this.hostElement.appendChild(
            this.root
        );

        this.render();
    }

    public update(
        options: VisualUpdateOptions
    ): void {
        this.root.style.width =
            `${options.viewport.width}px`;

        this.root.style.height =
            `${options.viewport.height}px`;

        this.root.classList.toggle(
            "compact",
            options.viewport.width < 900
        );

        this.root.classList.toggle(
            "narrow",
            options.viewport.width < 650
        );

        this.dataView =
            options.dataViews?.[0];

        this.availableFields =
            buildFieldsFromMetadata(
                this.dataView?.metadata.columns ?? []
            );

        this.removeUnavailableFieldsFromWells();

        this.render();
    }

    private render(): void {
        this.root.replaceChildren();

        const shell = this.createElement(
            "div",
            "pivot-shell"
        );

        shell.append(
            renderHeader(),
            this.renderWorkspace()
        );

        this.root.appendChild(shell);
    }

    private renderWorkspace(): HTMLElement {
        const workspace = this.createElement(
            "main",
            "pivot-workspace"
        );

        const mainColumn = this.createElement(
            "section",
            "pivot-main"
        );

        mainColumn.append(
            renderFieldWells({
                state: this.fieldWellsState,

                getDraggedField: () =>
                    this.draggedField,

                getDraggedWellField: () =>
                    this.draggedWellField,

                onWellFieldDragStart: (
                    draggedField
                ) => {
                    this.handleWellFieldDragStart(
                        draggedField
                    );
                },

                onWellFieldDragEnd: () => {
                    this.handleWellFieldDragEnd();
                },

                onFieldMove: (
                    field,
                    targetWell,
                    targetIndex,
                    sourceWell,
                    sourceIndex
                ) => {
                    this.handleFieldMove(
                        field,
                        targetWell,
                        targetIndex,
                        sourceWell,
                        sourceIndex
                    );
                },

                onFieldRemove: (
                    field,
                    sourceWell
                ) => {
                    this.handleFieldRemove(
                        field,
                        sourceWell
                    );
                },
            }),

            this.renderPivotArea()
        );

        workspace.append(
            mainColumn,

            renderFieldsPanel({
                fields:
                    this.getAvailableUnassignedFields(),

                onFieldDragStart: (
                    field,
                    event
                ) => {
                    this.handleFieldDragStart(
                        field,
                        event
                    );
                },

                onFieldDragEnd: (
                    field,
                    event
                ) => {
                    this.handleFieldDragEnd(
                        field,
                        event
                    );
                },
            })
        );

        return workspace;
    }

    private handleFieldDragStart(
        field: AnalyticsField,
        event: DragEvent
    ): void {
        this.draggedWellField =
            undefined;

        this.draggedField =
            field;

        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed =
                "move";

            event.dataTransfer.setData(
                "application/x-pivot-field-id",
                field.id
            );

            event.dataTransfer.setData(
                "text/plain",
                field.id
            );
        }
    }

    private handleFieldDragEnd(
        _field: AnalyticsField,
        _event: DragEvent
    ): void {
        this.draggedField =
            undefined;

        this.clearDropZoneHighlights();
    }

    private handleWellFieldDragStart(
        draggedField: DraggedWellField
    ): void {
        this.draggedField =
            undefined;

        this.draggedWellField =
            draggedField;
    }

    private handleWellFieldDragEnd(): void {
        this.draggedWellField =
            undefined;

        this.clearDropZoneHighlights();
    }

    private handleFieldMove(
        field: AnalyticsField,
        targetWell: FieldWellId,
        targetIndex: number,
        _sourceWell?: FieldWellId,
        _sourceIndex?: number
    ): void {
        this.removeFieldFromAllWells(
            field.id
        );

        const targetFields =
            this.fieldWellsState[targetWell];

        const safeTargetIndex =
            Math.max(
                0,
                Math.min(
                    targetIndex,
                    targetFields.length
                )
            );

        targetFields.splice(
            safeTargetIndex,
            0,
            field
        );

        this.draggedField =
            undefined;

        this.draggedWellField =
            undefined;

        this.render();
    }

    private handleFieldRemove(
        field: AnalyticsField,
        sourceWell: FieldWellId
    ): void {
        this.fieldWellsState[sourceWell] =
            this.fieldWellsState[
                sourceWell
            ].filter(
                (existingField) =>
                    existingField.id !== field.id
            );

        this.draggedField =
            undefined;

        this.draggedWellField =
            undefined;

        this.render();
    }

    private removeFieldFromAllWells(
        fieldId: string
    ): void {
        const wellIds: FieldWellId[] = [
            "rows",
            "columns",
            "values",
            "filters",
        ];

        wellIds.forEach((wellId) => {
            this.fieldWellsState[wellId] =
                this.fieldWellsState[
                    wellId
                ].filter(
                    (field) =>
                        field.id !== fieldId
                );
        });
    }

    private removeUnavailableFieldsFromWells(): void {
        const availableFieldIds =
            new Set(
                this.availableFields.map(
                    (field) => field.id
                )
            );

        const wellIds: FieldWellId[] = [
            "rows",
            "columns",
            "values",
            "filters",
        ];

        wellIds.forEach((wellId) => {
            this.fieldWellsState[wellId] =
                this.fieldWellsState[
                    wellId
                ].filter(
                    (field) =>
                        availableFieldIds.has(
                            field.id
                        )
                );
        });
    }

    private getAvailableUnassignedFields():
        AnalyticsField[] {
        const assignedFieldIds =
            new Set<string>([
                ...this.fieldWellsState.rows.map(
                    (field) => field.id
                ),

                ...this.fieldWellsState.columns.map(
                    (field) => field.id
                ),

                ...this.fieldWellsState.values.map(
                    (field) => field.id
                ),

                ...this.fieldWellsState.filters.map(
                    (field) => field.id
                ),
            ]);

        return this.availableFields.filter(
            (field) =>
                !assignedFieldIds.has(
                    field.id
                )
        );
    }

    private clearDropZoneHighlights(): void {
        this.root
            .querySelectorAll(
                ".pivot-drop-zone.drag-over"
            )
            .forEach((element) => {
                element.classList.remove(
                    "drag-over"
                );
            });
    }

    private renderPivotArea(): HTMLElement {
        const card = this.createElement(
            "section",
            "pivot-card pivot-results"
        );

        const toolbar = this.createElement(
            "div",
            "pivot-toolbar"
        );

        const toolbarRight = this.createElement(
            "div",
            "pivot-toolbar-right"
        );

        toolbarRight.append(
            this.createElement(
                "button",
                "pivot-view-button active",
                "▦"
            ),

            this.createElement(
                "button",
                "pivot-view-button",
                "☷"
            ),

            this.createElement(
                "button",
                "pivot-toolbar-button",
                "↓"
            ),

            this.createElement(
                "button",
                "pivot-toolbar-button",
                "⛶"
            )
        );

        toolbar.appendChild(
            toolbarRight
        );

        const tableWrapper = this.createElement(
            "div",
            "pivot-table-wrapper"
        );


        tableWrapper.appendChild(
            renderPivotTable({
                dataView: this.dataView,
                fieldWellsState: this.fieldWellsState,
            })
        );

        const footer = this.createElement(
            "div",
            "pivot-footer"
        );

        footer.append(
            this.createElement(
                "span",
                "pivot-footer-icon",
                "ⓘ"
            ),

            this.createElement(
                "span",
                "pivot-footer-text",
                "Configure the field wells to build the table"
            )
        );

        card.append(
            toolbar,
            tableWrapper,
            footer
        );

        return card;
    }



    private createElement<
        K extends keyof HTMLElementTagNameMap
    >(
        tagName: K,
        className = "",
        text?: string
    ): HTMLElementTagNameMap[K] {
        const element =
            document.createElement(
                tagName
            );

        if (className) {
            element.className =
                className;
        }

        if (text !== undefined) {
            element.textContent =
                text;
        }

        return element;
    }
}