import { AnalyticsField } from "./fieldsPanel";
export type FieldWellId = "rows" | "columns" | "values" | "filters";
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
    getDraggedField: () => AnalyticsField | undefined;
    /**
     * Returns a field currently being dragged from another field well.
     */
    getDraggedWellField: () => DraggedWellField | undefined;
    /**
     * Called when a field chip starts being dragged.
     */
    onWellFieldDragStart: (draggedField: DraggedWellField) => void;
    /**
     * Called when dragging a field chip finishes.
     */
    onWellFieldDragEnd: () => void;
    /**
     * Called when a field is moved into a field well.
     */
    onFieldMove: (field: AnalyticsField, targetWell: FieldWellId, targetIndex: number, sourceWell?: FieldWellId, sourceIndex?: number) => void;
    /**
     * Called when the remove button on a field chip is selected.
     */
    onFieldRemove: (field: AnalyticsField, sourceWell: FieldWellId) => void;
}
export declare function createEmptyFieldWellsState(): FieldWellsState;
export declare function renderFieldWells(options: FieldWellsOptions): HTMLElement;
