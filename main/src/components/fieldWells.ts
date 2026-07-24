"use strict";

import {
    AnalyticsField,
} from "./fieldsPanel";

export type FieldWellId =
    | "rows"
    | "columns"
    | "values"
    | "filters";

export interface FieldWellDefinition {
    id: FieldWellId;
    title: string;
    icon: string;
    tone: "blue" | "green";
}

export interface FieldWellsState {
    rows: AnalyticsField[];
    columns: AnalyticsField[];
    values: AnalyticsField[];
    filters: AnalyticsField[];
}

export interface DraggedWellField {
    field: AnalyticsField;
    sourceWell: FieldWellId;
    sourceIndex: number;
}

export interface FieldWellsOptions {
    state: FieldWellsState;

    /**
     * Returns a field currently being dragged from the Fields panel.
     */
    getDraggedField: () =>
        AnalyticsField | undefined;

    /**
     * Returns a field currently being dragged from another field well.
     */
    getDraggedWellField: () =>
        DraggedWellField | undefined;

    /**
     * Called when a field chip starts being dragged.
     */
    onWellFieldDragStart: (
        draggedField: DraggedWellField
    ) => void;

    /**
     * Called when dragging a field chip finishes.
     */
    onWellFieldDragEnd: () => void;

    /**
     * Called when a field is moved into a field well.
     */
    onFieldMove: (
        field: AnalyticsField,
        targetWell: FieldWellId,
        targetIndex: number,
        sourceWell?: FieldWellId,
        sourceIndex?: number
    ) => void;

    /**
     * Called when the remove button on a field chip is selected.
     */
    onFieldRemove: (
        field: AnalyticsField,
        sourceWell: FieldWellId
    ) => void;
}

const WELL_DEFINITIONS: FieldWellDefinition[] = [
    {
        id: "rows",
        title: "Rows",
        icon: "☰",
        tone: "blue",
    },
    {
        id: "columns",
        title: "Columns",
        icon: "▥",
        tone: "blue",
    },
    {
        id: "values",
        title: "Values",
        icon: "∑",
        tone: "green",
    },
    {
        id: "filters",
        title: "Filters",
        icon: "▽",
        tone: "blue",
    },
];

export function createEmptyFieldWellsState(): FieldWellsState {
    return {
        rows: [],
        columns: [],
        values: [],
        filters: [],
    };
}

export function renderFieldWells(
    options: FieldWellsOptions
): HTMLElement {
    const card = createElement(
        "section",
        "pivot-card pivot-builder"
    );

    const instruction = createElement(
        "div",
        "pivot-instruction",
        "Drag fields between areas below:"
    );

    const wells = createElement(
        "div",
        "pivot-wells"
    );

    WELL_DEFINITIONS.forEach((definition) => {
        wells.appendChild(
            renderWell(
                definition,
                options
            )
        );
    });

    card.append(
        instruction,
        wells
    );

    return card;
}

function renderWell(
    definition: FieldWellDefinition,
    options: FieldWellsOptions
): HTMLElement {
    const well = createElement(
        "div",
        "pivot-well"
    );

    well.dataset.wellId =
        definition.id;

    const header = createElement(
        "div",
        "pivot-well-header"
    );

    const heading = createElement(
        "div",
        "pivot-well-heading"
    );

    heading.append(
        createElement(
            "span",
            "pivot-well-icon",
            definition.icon
        ),
        createElement(
            "span",
            "pivot-well-title",
            definition.title
        )
    );

    header.append(
        heading,
        createElement(
            "span",
            "pivot-chevron",
            "⌄"
        )
    );

    const dropZone = createElement(
        "div",
        "pivot-drop-zone"
    );

    dropZone.dataset.wellId =
        definition.id;

    dropZone.setAttribute(
        "role",
        "list"
    );

    dropZone.setAttribute(
        "aria-label",
        `${definition.title} field well`
    );

    registerDropEvents(
        dropZone,
        definition.id,
        options
    );

    const fields =
        options.state[definition.id];

    if (fields.length === 0) {
        dropZone.appendChild(
            createElement(
                "span",
                "pivot-placeholder",
                "Drag fields here"
            )
        );
    } else {
        fields.forEach((field, index) => {
            dropZone.appendChild(
                renderFieldChip(
                    field,
                    index,
                    definition,
                    options
                )
            );
        });
    }

    well.append(
        header,
        dropZone
    );

    return well;
}

function registerDropEvents(
    dropZone: HTMLElement,
    targetWell: FieldWellId,
    options: FieldWellsOptions
): void {
    dropZone.addEventListener(
        "dragenter",
        (event: DragEvent) => {
            event.preventDefault();

            dropZone.classList.add(
                "drag-over"
            );
        }
    );

    dropZone.addEventListener(
        "dragover",
        (event: DragEvent) => {
            event.preventDefault();

            if (event.dataTransfer) {
                event.dataTransfer.dropEffect =
                    "move";
            }

            dropZone.classList.add(
                "drag-over"
            );
        }
    );

    dropZone.addEventListener(
        "dragleave",
        (event: DragEvent) => {
            const relatedTarget =
                event.relatedTarget;

            if (
                relatedTarget instanceof Node &&
                dropZone.contains(relatedTarget)
            ) {
                return;
            }

            dropZone.classList.remove(
                "drag-over"
            );
        }
    );

    dropZone.addEventListener(
        "drop",
        (event: DragEvent) => {
            event.preventDefault();

            dropZone.classList.remove(
                "drag-over"
            );

            const targetIndex =
                getDropIndex(
                    dropZone,
                    event.clientY
                );

            const draggedWellField =
                options.getDraggedWellField();

            if (draggedWellField) {
                options.onFieldMove(
                    draggedWellField.field,
                    targetWell,
                    targetIndex,
                    draggedWellField.sourceWell,
                    draggedWellField.sourceIndex
                );

                return;
            }

            const draggedField =
                options.getDraggedField();

            if (!draggedField) {
                return;
            }

            options.onFieldMove(
                draggedField,
                targetWell,
                targetIndex
            );
        }
    );
}

function renderFieldChip(
    field: AnalyticsField,
    fieldIndex: number,
    definition: FieldWellDefinition,
    options: FieldWellsOptions
): HTMLElement {
    const chip = createElement(
        "div",
        `pivot-chip pivot-chip-${definition.tone}`
    );

    chip.draggable = true;

    chip.dataset.fieldId =
        field.id;

    chip.dataset.wellId =
        definition.id;

    chip.dataset.fieldIndex =
        fieldIndex.toString();

    chip.setAttribute(
        "role",
        "listitem"
    );

    chip.setAttribute(
        "tabindex",
        "0"
    );

    chip.setAttribute(
        "aria-label",
        `${field.name} in ${definition.title}`
    );

    chip.addEventListener(
        "dragstart",
        (event: DragEvent) => {
            chip.classList.add(
                "dragging"
            );

            if (event.dataTransfer) {
                event.dataTransfer.effectAllowed =
                    "move";

                event.dataTransfer.setData(
                    "text/plain",
                    field.id
                );
            }

            options.onWellFieldDragStart({
                field,
                sourceWell: definition.id,
                sourceIndex: fieldIndex,
            });
        }
    );

    chip.addEventListener(
        "dragend",
        () => {
            chip.classList.remove(
                "dragging"
            );

            document
                .querySelectorAll(
                    ".pivot-drop-zone.drag-over"
                )
                .forEach((element) => {
                    element.classList.remove(
                        "drag-over"
                    );
                });

            options.onWellFieldDragEnd();
        }
    );

    const label = createElement(
        "span",
        "pivot-chip-label",
        getChipLabel(
            field,
            definition.id
        )
    );

    label.title =
        label.textContent ?? field.name;

    const removeButton =
        document.createElement("button");

    removeButton.type =
        "button";

    removeButton.className =
        "pivot-chip-remove";

    removeButton.textContent =
        "×";

    removeButton.draggable =
        false;

    removeButton.setAttribute(
        "aria-label",
        `Remove ${field.name} from ${definition.title}`
    );

    removeButton.addEventListener(
        "mousedown",
        (event: MouseEvent) => {
            event.stopPropagation();
        }
    );

    removeButton.addEventListener(
        "dragstart",
        (event: DragEvent) => {
            event.preventDefault();
            event.stopPropagation();
        }
    );

    removeButton.addEventListener(
        "click",
        (event: MouseEvent) => {
            event.stopPropagation();

            options.onFieldRemove(
                field,
                definition.id
            );
        }
    );

    chip.append(
        label,
        removeButton
    );

    return chip;
}

function getChipLabel(
    field: AnalyticsField,
    well: FieldWellId
): string {
    if (
        well === "values" &&
        !field.isMeasure &&
        field.type === "number"
    ) {
        return `${field.name} (Sum)`;
    }

    return field.name;
}

function getDropIndex(
    dropZone: HTMLElement,
    pointerY: number
): number {
    const chips = Array.from(
        dropZone.querySelectorAll<HTMLElement>(
            ".pivot-chip:not(.dragging)"
        )
    );

    for (
        let index = 0;
        index < chips.length;
        index += 1
    ) {
        const bounds =
            chips[index].getBoundingClientRect();

        const midpoint =
            bounds.top +
            bounds.height / 2;

        if (pointerY < midpoint) {
            return index;
        }
    }

    return chips.length;
}

function createElement<
    K extends keyof HTMLElementTagNameMap
>(
    tagName: K,
    className = "",
    text?: string
): HTMLElementTagNameMap[K] {
    const element =
        document.createElement(tagName);

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