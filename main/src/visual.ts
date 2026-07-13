"use strict";

import powerbi from "powerbi-visuals-api";

import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions =
    powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions =
    powerbi.extensibility.visual.VisualUpdateOptions;

export class Visual implements IVisual {
    private readonly hostElement: HTMLElement;
    private readonly root: HTMLDivElement;
    private readonly styleElement: HTMLStyleElement;

    constructor(options: VisualConstructorOptions) {
        this.hostElement = options.element;

        /*
         * Clear anything Power BI previously rendered inside the visual.
         */
        this.hostElement.replaceChildren();

        /*
         * Keep the stylesheet outside the render root.
         * This prevents render() from deleting it.
         */
        this.styleElement = document.createElement("style");
        this.styleElement.textContent = this.getStyles();

        /*
         * All visual content is rendered inside this root.
         */
        this.root = document.createElement("div");
        this.root.className = "pivot-wireframe";

        this.hostElement.append(
            this.styleElement,
            this.root
        );

        this.render();
    }

    public update(options: VisualUpdateOptions): void {
        this.root.style.width = `${options.viewport.width}px`;
        this.root.style.height = `${options.viewport.height}px`;

        this.root.classList.toggle(
            "compact",
            options.viewport.width < 900
        );

        this.root.classList.toggle(
            "narrow",
            options.viewport.width < 650
        );
    }

    private render(): void {
        /*
         * Only clear the visual content.
         * The stylesheet remains attached to the host element.
         */
        this.root.replaceChildren();

        const shell = this.createElement(
            "div",
            "pivot-shell"
        );

        shell.append(
            this.renderHeader(),
            this.renderWorkspace()
        );

        this.root.appendChild(shell);
    }

    private renderHeader(): HTMLElement {
        const header = this.createElement(
            "header",
            "pivot-header"
        );

        const left = this.createElement(
            "div",
            "pivot-header-left"
        );

        const logo = this.createElement(
            "div",
            "pivot-logo",
            "▦"
        );

        const textArea = this.createElement(
            "div",
            "pivot-header-copy"
        );

        const titleLine = this.createElement(
            "div",
            "pivot-title-line"
        );

        const title = this.createElement(
            "h1",
            "pivot-title",
            "Pivot Visual"
        );

        const badge = this.createElement(
            "span",
            "pivot-badge",
            "Preview"
        );

        titleLine.append(title, badge);

        const subtitle = this.createElement(
            "p",
            "pivot-subtitle",
            "Build a pivot table by placing fields in Rows, Columns or Values."
        );

        textArea.append(titleLine, subtitle);
        left.append(logo, textArea);

        const actions = this.createElement(
            "div",
            "pivot-header-actions"
        );

        actions.append(
            this.createButton("↶", "Undo"),
            this.createButton("↷", "Redo"),
            this.createButton("⚙", "Settings"),
            this.createButton("•••", "More options")
        );

        header.append(left, actions);

        return header;
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
            this.renderFieldsPanel()
        );

        return workspace;
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

        card.append(instruction, wells);

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

        well.append(header, dropZone);

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

        const rows = [
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

        [
            "Grand Total",
            "$22.1M",
            "$25.5M",
            "$28.1M",
            "$30.1M",
            "$105.7M",
        ].forEach((value, index) => {
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

    private renderFieldsPanel(): HTMLElement {
        const panel = this.createElement(
            "aside",
            "pivot-fields-panel"
        );

        const title = this.createElement(
            "h2",
            "pivot-fields-title",
            "Fields"
        );

        const search = this.createElement(
            "div",
            "pivot-search"
        );

        search.append(
            this.createElement(
                "span",
                "pivot-search-icon",
                "⌕"
            ),
            this.createElement(
                "span",
                "pivot-search-placeholder",
                "Search fields"
            )
        );

        const fieldList = this.createElement(
            "div",
            "pivot-field-list"
        );

        fieldList.append(
            this.renderFieldGroup(
                "▦",
                "Sales",
                [
                    ["Calendar Year", "date", true],
                    ["Calendar Quarter", "date", false],
                    ["Calendar Month", "date", false],
                ]
            ),
            this.renderFieldGroup(
                "◇",
                "Products",
                [
                    ["Product Category", "text", true],
                    ["Product Subcategory", "text", false],
                    ["Product", "text", false],
                ]
            ),
            this.renderFieldGroup(
                "Σ",
                "Measures",
                [
                    ["Sales Amount", "number", true],
                    ["Order Quantity", "number", false],
                    ["Discount Amount", "number", false],
                    ["Customer Count", "number", false],
                ]
            ),
            this.renderFieldGroup(
                "◎",
                "Geography",
                [
                    ["Region", "geography", false],
                    ["Country", "geography", false],
                ]
            )
        );

        const help = this.createElement(
            "div",
            "pivot-help"
        );

        help.append(
            this.createElement(
                "span",
                "pivot-help-icon",
                "ⓘ"
            ),
            this.createElement(
                "span",
                "pivot-help-text",
                "Drag fields to Rows, Columns or Values to build your pivot table."
            )
        );

        panel.append(
            title,
            search,
            fieldList,
            help
        );

        return panel;
    }

    private renderFieldGroup(
        icon: string,
        title: string,
        fields: Array<[string, string, boolean]>
    ): HTMLElement {
        const group = this.createElement(
            "section",
            "pivot-field-group"
        );

        const header = this.createElement(
            "div",
            "pivot-field-group-header"
        );

        const heading = this.createElement(
            "div",
            "pivot-field-group-heading"
        );

        heading.append(
            this.createElement(
                "span",
                "pivot-field-group-icon",
                icon
            ),
            this.createElement(
                "span",
                "pivot-field-group-title",
                title
            )
        );

        header.append(
            heading,
            this.createElement(
                "span",
                "pivot-field-group-chevron",
                "⌄"
            )
        );

        const body = this.createElement(
            "div",
            "pivot-field-group-body"
        );

        fields.forEach(
            ([name, type, selected]) => {
                body.appendChild(
                    this.renderFieldItem(
                        name,
                        type,
                        selected
                    )
                );
            }
        );

        group.append(header, body);

        return group;
    }

    private renderFieldItem(
        name: string,
        type: string,
        selected: boolean
    ): HTMLElement {
        const item = this.createElement(
            "div",
            "pivot-field-item"
        );

        const checkbox = this.createElement(
            "span",
            selected
                ? "pivot-checkbox selected"
                : "pivot-checkbox"
        );

        if (selected) {
            checkbox.textContent = "✓";
        }

        let typeIcon = "ABC";

        if (type === "date") {
            typeIcon = "▣";
        }

        if (type === "number") {
            typeIcon = "1.2";
        }

        if (type === "geography") {
            typeIcon = "◎";
        }

        item.append(
            checkbox,
            this.createElement(
                "span",
                "pivot-field-type",
                typeIcon
            ),
            this.createElement(
                "span",
                "pivot-field-name",
                name
            )
        );

        return item;
    }

    private createButton(
        text: string,
        title: string
    ): HTMLButtonElement {
        const button = this.createElement(
            "button",
            "pivot-header-button",
            text
        ) as HTMLButtonElement;

        button.type = "button";
        button.title = title;

        return button;
    }

    private createElement<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        className = "",
        text?: string
    ): HTMLElementTagNameMap[K] {
        const element = document.createElement(tagName);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    private getStyles(): string {
        return `
            .pivot-wireframe,
            .pivot-wireframe * {
                box-sizing: border-box;
            }

            .pivot-wireframe {
                width: 100%;
                height: 100%;
                min-width: 0;
                overflow: hidden;
                background: #f5f7fa;
                color: #142033;
                font-family:
                    "Segoe UI",
                    Arial,
                    sans-serif;
                font-size: 14px;
            }

            .pivot-shell {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
            }

            .pivot-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-height: 90px;
                padding: 18px 24px;
                background: #ffffff;
                border-bottom: 1px solid #e1e6ee;
            }

            .pivot-header-left {
                display: flex;
                align-items: center;
                min-width: 0;
                gap: 14px;
            }

            .pivot-logo {
                display: grid;
                place-items: center;
                width: 42px;
                height: 42px;
                flex: 0 0 42px;
                border: 1px solid #cfd8e6;
                border-radius: 8px;
                background: #f6f8fb;
                color: #47576d;
                font-size: 24px;
            }

            .pivot-header-copy {
                min-width: 0;
            }

            .pivot-title-line {
                display: flex;
                align-items: center;
                gap: 9px;
            }

            .pivot-title {
                margin: 0;
                font-size: 21px;
                font-weight: 700;
                line-height: 1.2;
            }

            .pivot-badge {
                padding: 4px 9px;
                border-radius: 12px;
                background: #edf1f7;
                color: #506078;
                font-size: 11px;
                font-weight: 600;
            }

            .pivot-subtitle {
                margin: 5px 0 0;
                color: #6d7888;
                font-size: 13px;
            }

            .pivot-header-actions {
                display: flex;
                gap: 7px;
            }

            .pivot-header-button,
            .pivot-toolbar-button,
            .pivot-view-button {
                display: grid;
                place-items: center;
                width: 36px;
                height: 36px;
                padding: 0;
                border: 0;
                border-radius: 7px;
                background: transparent;
                color: #566376;
                cursor: pointer;
            }

            .pivot-header-button:hover,
            .pivot-toolbar-button:hover {
                background: #f0f3f7;
            }

            .pivot-workspace {
                display: grid;
                grid-template-columns:
                    minmax(0, 1fr)
                    290px;
                min-height: 0;
                flex: 1;
                gap: 18px;
                padding: 18px;
                overflow: hidden;
            }

            .pivot-main {
                display: flex;
                flex-direction: column;
                min-width: 0;
                min-height: 0;
                gap: 17px;
            }

            .pivot-card,
            .pivot-fields-panel {
                background: #ffffff;
                border: 1px solid #e0e5ec;
                border-radius: 9px;
                box-shadow:
                    0 1px 2px rgba(0, 0, 0, 0.03),
                    0 4px 12px rgba(0, 0, 0, 0.025);
            }

            .pivot-builder {
                flex: 0 0 auto;
                padding: 16px;
            }

            .pivot-instruction {
                margin-bottom: 13px;
                color: #647084;
                font-size: 13px;
            }

            .pivot-wells {
                display: grid;
                grid-template-columns:
                    repeat(4, minmax(0, 1fr));
                overflow: hidden;
                border: 1px solid #dfe5ed;
                border-radius: 8px;
            }

            .pivot-well {
                min-width: 0;
                padding: 14px;
                border-right: 1px solid #dfe5ed;
            }

            .pivot-well:last-child {
                border-right: 0;
            }

            .pivot-well-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
            }

            .pivot-well-heading {
                display: flex;
                align-items: center;
                min-width: 0;
                gap: 8px;
            }

            .pivot-well-icon {
                color: #667487;
                font-size: 17px;
            }

            .pivot-well-title {
                font-size: 13px;
                font-weight: 600;
            }

            .pivot-chevron {
                color: #778397;
                font-size: 14px;
            }

            .pivot-drop-zone {
                display: flex;
                align-items: center;
                min-height: 45px;
                min-width: 0;
                padding: 5px;
                border: 1px dashed #cdd5df;
                border-radius: 7px;
                background: #fafbfc;
            }

            .pivot-chip {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                min-width: 0;
                height: 34px;
                padding: 0 10px;
                border-radius: 6px;
            }

            .pivot-chip-blue {
                background: #eaf2ff;
                color: #1664c8;
            }

            .pivot-chip-green {
                background: #e8f5eb;
                color: #267647;
            }

            .pivot-chip-label {
                min-width: 0;
                overflow: hidden;
                font-size: 12px;
                font-weight: 500;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .pivot-chip-remove {
                margin-left: 8px;
                font-size: 17px;
            }

            .pivot-placeholder {
                width: 100%;
                color: #8b95a5;
                font-size: 12px;
                text-align: center;
            }

            .pivot-results {
                display: flex;
                flex-direction: column;
                min-height: 0;
                flex: 1;
                overflow: hidden;
            }

            .pivot-toolbar {
                display: flex;
                justify-content: flex-end;
                min-height: 54px;
                padding: 9px 13px;
                border-bottom: 1px solid #e0e5ec;
            }

            .pivot-toolbar-right {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .pivot-view-button {
                border: 1px solid #d8dee7;
                border-radius: 0;
            }

            .pivot-view-button:first-child {
                border-radius: 6px 0 0 6px;
            }

            .pivot-view-button:nth-child(2) {
                margin-left: -7px;
                border-radius: 0 6px 6px 0;
            }

            .pivot-view-button.active {
                background: #edf4ff;
                color: #1769d8;
            }

            .pivot-table-wrapper {
                min-width: 0;
                min-height: 0;
                flex: 1;
                padding: 13px;
                overflow: auto;
            }

            .pivot-table {
                min-width: 760px;
                overflow: hidden;
                border: 1px solid #dce2ea;
                border-radius: 7px;
            }

            .pivot-table-row {
                display: grid;
                grid-template-columns:
                    210px
                    repeat(5, minmax(110px, 1fr));
            }

            .pivot-top-header {
                grid-template-columns:
                    210px
                    minmax(550px, 5fr);
            }

            .pivot-category-header {
                grid-template-columns:
                    210px
                    minmax(550px, 5fr);
            }

            .pivot-cell {
                display: flex;
                align-items: center;
                min-height: 52px;
                padding: 10px 13px;
                border-right: 1px solid #e1e6ed;
                border-bottom: 1px solid #e1e6ed;
                background: #ffffff;
                font-size: 12px;
            }

            .pivot-cell:last-child {
                border-right: 0;
            }

            .pivot-table-row:last-child .pivot-cell {
                border-bottom: 0;
            }

            .pivot-top-header .pivot-cell,
            .pivot-year-header .pivot-cell,
            .pivot-category-header .pivot-cell {
                background: #fafbfd;
                font-weight: 600;
            }

            .pivot-column-header {
                justify-content: flex-start;
            }

            .pivot-row-header {
                font-weight: 600;
            }

            .numeric {
                justify-content: flex-end;
                font-variant-numeric: tabular-nums;
            }

            .total-cell {
                background: #fafbfd;
                font-weight: 700;
            }

            .grand-total .pivot-cell {
                background: #f6f8fb;
                font-weight: 700;
            }

            .pivot-footer {
                display: flex;
                align-items: center;
                min-height: 53px;
                gap: 8px;
                padding: 0 16px;
                border-top: 1px solid #e0e5ec;
                color: #69768a;
            }

            .pivot-footer-text {
                font-size: 11px;
            }

            .pivot-fields-panel {
                display: flex;
                flex-direction: column;
                min-width: 0;
                min-height: 0;
                overflow: hidden;
            }

            .pivot-fields-title {
                margin: 0;
                padding: 17px 17px 11px;
                font-size: 16px;
            }

            .pivot-search {
                display: flex;
                align-items: center;
                min-height: 40px;
                margin: 0 17px 10px;
                gap: 8px;
                padding: 0 10px;
                border: 1px solid #d6dde7;
                border-radius: 7px;
                color: #8590a1;
            }

            .pivot-search-icon {
                font-size: 19px;
            }

            .pivot-search-placeholder {
                font-size: 12px;
            }

            .pivot-field-list {
                min-height: 0;
                flex: 1;
                padding: 0 17px;
                overflow-y: auto;
            }

            .pivot-field-group {
                padding: 8px 0 10px;
                border-bottom: 1px solid #e4e8ee;
            }

            .pivot-field-group-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-height: 32px;
            }

            .pivot-field-group-heading {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .pivot-field-group-title {
                font-size: 12px;
                font-weight: 600;
            }

            .pivot-field-group-chevron {
                color: #748094;
            }

            .pivot-field-group-body {
                display: flex;
                flex-direction: column;
            }

            .pivot-field-item {
                display: grid;
                grid-template-columns:
                    17px
                    23px
                    minmax(0, 1fr);
                align-items: center;
                min-height: 32px;
                gap: 7px;
                border-radius: 5px;
            }

            .pivot-field-item:hover {
                background: #f5f7fa;
            }

            .pivot-checkbox {
                display: grid;
                place-items: center;
                width: 16px;
                height: 16px;
                border: 1px solid #aeb8c5;
                border-radius: 3px;
                color: white;
                font-size: 10px;
            }

            .pivot-checkbox.selected {
                border-color: #1769d8;
                background: #1769d8;
            }

            .pivot-field-type {
                color: #738095;
                font-size: 10px;
            }

            .pivot-field-name {
                min-width: 0;
                overflow: hidden;
                color: #344155;
                font-size: 12px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .pivot-help {
                display: flex;
                align-items: flex-start;
                min-height: 78px;
                gap: 8px;
                padding: 14px 17px;
                border-top: 1px solid #dfe5ec;
                background: #f3f7ff;
                color: #245fae;
            }

            .pivot-help-text {
                font-size: 11px;
                line-height: 1.45;
            }

            .pivot-wireframe.compact
            .pivot-workspace {
                grid-template-columns:
                    minmax(0, 1fr)
                    240px;
                gap: 11px;
                padding: 11px;
            }

            .pivot-wireframe.compact
            .pivot-wells {
                grid-template-columns:
                    repeat(2, minmax(0, 1fr));
            }

            .pivot-wireframe.compact
            .pivot-well:nth-child(2) {
                border-right: 0;
            }

            .pivot-wireframe.compact
            .pivot-well:nth-child(-n + 2) {
                border-bottom: 1px solid #dfe5ed;
            }

            .pivot-wireframe.narrow
            .pivot-workspace {
                display: flex;
                flex-direction: column;
                overflow-y: auto;
            }

            .pivot-wireframe.narrow
            .pivot-header-actions {
                display: none;
            }

            .pivot-wireframe.narrow
            .pivot-subtitle {
                display: none;
            }

            .pivot-wireframe.narrow
            .pivot-wells {
                grid-template-columns: 1fr;
            }

            .pivot-wireframe.narrow
            .pivot-well {
                border-right: 0;
                border-bottom: 1px solid #dfe5ed;
            }

            .pivot-wireframe.narrow
            .pivot-fields-panel {
                min-height: 400px;
            }
        `;
    }
}