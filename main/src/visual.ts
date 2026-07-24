"use strict";

import "./components/style.less";

import { renderHeader } from "./components/header";
import {
    AnalyticsField,
    buildFieldsFromMetadata,
    renderFieldsPanel,
} from "./components/fieldsPanel";

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

    constructor(options: VisualConstructorOptions) {
        this.hostElement = options.element;

        this.hostElement.replaceChildren();

        this.root = document.createElement("div");
        this.root.className = "pivot-wireframe";

        this.hostElement.appendChild(this.root);

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
            this.renderFieldWells(),
            this.renderPivotArea()
        );

        workspace.append(
            mainColumn,
            renderFieldsPanel({
                fields: this.availableFields,
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
        this.draggedField = field;

        event.dataTransfer?.setData(
            "application/x-pivot-field-id",
            field.id
        );

        console.log(
            `Started dragging ${field.name}`
        );
    }

    private handleFieldDragEnd(
        field: AnalyticsField,
        event: DragEvent
    ): void {
        console.log(
            `Finished dragging ${field.name}`,
            event.dataTransfer?.dropEffect ?? "none"
        );

        this.draggedField = undefined;
    }

    private renderFieldWells(): HTMLElement {
        const card = this.createElement(
            "section",
            "pivot-card pivot-builder"
        );

        const instruction = this.createElement(
            "div",
            "pivot-instruction",
            "Drag fields between areas below:"
        );

        const wells = this.createElement(
            "div",
            "pivot-wells"
        );

        wells.append(
            this.renderWell(
                "☰",
                "Rows",
                "Product Category",
                "blue"
            ),
            this.renderWell(
                "▥",
                "Columns",
                "Calendar Year",
                "blue"
            ),
            this.renderWell(
                "Σ",
                "Values",
                "Sales Amount (Sum)",
                "green"
            ),
            this.renderWell(
                "▽",
                "Filters",
                "",
                "empty"
            )
        );

        card.append(
            instruction,
            wells
        );

        return card;
    }

    private renderWell(
        icon: string,
        title: string,
        field: string,
        tone: "blue" | "green" | "empty"
    ): HTMLElement {
        const well = this.createElement(
            "div",
            "pivot-well"
        );

        const header = this.createElement(
            "div",
            "pivot-well-header"
        );

        const heading = this.createElement(
            "div",
            "pivot-well-heading"
        );

        heading.append(
            this.createElement(
                "span",
                "pivot-well-icon",
                icon
            ),
            this.createElement(
                "span",
                "pivot-well-title",
                title
            )
        );

        header.append(
            heading,
            this.createElement(
                "span",
                "pivot-chevron",
                "⌄"
            )
        );

        const dropZone = this.createElement(
            "div",
            "pivot-drop-zone"
        );

        if (field) {
            const chip = this.createElement(
                "div",
                `pivot-chip pivot-chip-${tone}`
            );

            chip.append(
                this.createElement(
                    "span",
                    "pivot-chip-label",
                    field
                ),
                this.createElement(
                    "span",
                    "pivot-chip-remove",
                    "×"
                )
            );

            dropZone.appendChild(chip);
        } else {
            dropZone.appendChild(
                this.createElement(
                    "span",
                    "pivot-placeholder",
                    "Drag fields here"
                )
            );
        }

        well.append(
            header,
            dropZone
        );

        return well;
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

        toolbar.appendChild(toolbarRight);

        const tableWrapper = this.createElement(
            "div",
            "pivot-table-wrapper"
        );

        tableWrapper.appendChild(
            this.renderTableWireframe()
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
                "Showing top 4 of 4 Product Category"
            )
        );

        card.append(
            toolbar,
            tableWrapper,
            footer
        );

        return card;
    }

    private renderTableWireframe(): HTMLElement {
        const table = this.createElement(
            "div",
            "pivot-table"
        );

        const topHeader = this.createElement(
            "div",
            "pivot-table-row pivot-top-header"
        );

        topHeader.append(
            this.createElement(
                "div",
                "pivot-cell pivot-row-header tall",
                "Sum of Sales Amount"
            ),
            this.createElement(
                "div",
                "pivot-cell pivot-column-header wide",
                "Calendar Year"
            )
        );

        const yearHeader = this.createElement(
            "div",
            "pivot-table-row pivot-year-header"
        );

        yearHeader.append(
            this.createElement(
                "div",
                "pivot-cell pivot-row-header",
                ""
            ),
            this.createElement(
                "div",
                "pivot-cell",
                "2021"
            ),
            this.createElement(
                "div",
                "pivot-cell",
                "2022"
            ),
            this.createElement(
                "div",
                "pivot-cell",
                "2023"
            ),
            this.createElement(
                "div",
                "pivot-cell",
                "2024"
            ),
            this.createElement(
                "div",
                "pivot-cell total-cell",
                "Grand Total"
            )
        );

        const categoryHeader = this.createElement(
            "div",
            "pivot-table-row pivot-category-header"
        );

        categoryHeader.append(
            this.createElement(
                "div",
                "pivot-cell pivot-row-header",
                "Product Category"
            ),
            this.createElement(
                "div",
                "pivot-cell pivot-empty-span",
                ""
            )
        );

        table.append(
            topHeader,
            yearHeader,
            categoryHeader
        );

        const rows: string[][] = [
            [
                "Bikes",
                "$12.6M",
                "$14.8M",
                "$16.2M",
                "$17.5M",
                "$61.1M",
            ],
            [
                "Components",
                "$6.2M",
                "$7.1M",
                "$7.9M",
                "$8.3M",
                "$29.5M",
            ],
            [
                "Accessories",
                "$2.2M",
                "$2.4M",
                "$2.7M",
                "$2.8M",
                "$10.0M",
            ],
            [
                "Clothing",
                "$1.0M",
                "$1.2M",
                "$1.3M",
                "$1.5M",
                "$5.0M",
            ],
        ];

        rows.forEach((row) => {
            const rowElement = this.createElement(
                "div",
                "pivot-table-row"
            );

            row.forEach((value, index) => {
                const className =
                    index === 0
                        ? "pivot-cell pivot-row-header"
                        : index === row.length - 1
                            ? "pivot-cell numeric total-cell"
                            : "pivot-cell numeric";

                const text =
                    index === 0
                        ? `›  ${value}`
                        : value;

                rowElement.appendChild(
                    this.createElement(
                        "div",
                        className,
                        text
                    )
                );
            });

            table.appendChild(rowElement);
        });

        const totalRow = this.createElement(
            "div",
            "pivot-table-row grand-total"
        );

        const totals = [
            "Grand Total",
            "$22.1M",
            "$25.5M",
            "$28.1M",
            "$30.1M",
            "$105.7M",
        ];

        totals.forEach((value, index) => {
            totalRow.appendChild(
                this.createElement(
                    "div",
                    index === 0
                        ? "pivot-cell pivot-row-header"
                        : "pivot-cell numeric",
                    value
                )
            );
        });

        table.appendChild(totalRow);

        return table;
    }

    private createElement<
        K extends keyof HTMLElementTagNameMap
    >(
        tagName: K,
        className = "",
        text?: string
    ): HTMLElementTagNameMap[K] {
        const element =
            document.createElement(tagName);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }
}