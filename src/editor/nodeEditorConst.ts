import { EditorStage } from "./nodeEditorHost";

// Node Consts
export const NE_PANEL_WIDTH = 150;
export const NE_CONTEXT_HEADER_PAD = 20;
export const NE_CONTEXT_ELEMNT_PAD = 20;
export const NE_FONT_FAMILY = 'Arial';
export const NE_SCALE_STRENGTH = 1.03;

// Head Consts
export const NE_METHOD_TXT_PAD_LEFT = 15;
export const NE_METHOD_TXT_PAD_BOT = 10;
export const NE_METHOD_TXT_FONT_SIZE = 16;
export const NE_METHOD_PANEL_OPACITY = 1;//0.6;

// Body Consts
/**
 * Padding connectors from left and right
*/
export const NE_CONNECTOR_PAD_HORIZONTAL = 10;
/**
 * Text size of a connector
*/
export const NE_CONNECTOR_TXT_FONT_SIZE = 13;
/**
 * Text Width must not exceed this value or it will be trimmed <br />
 * This refers to text next to connectors.
*/
export const NE_CONNECTOR_TXT_WIDTH = NE_PANEL_WIDTH / 3;
/**
 * Connector size
*/
export const NE_CONNECTOR_RADIUS = 4.5;
/**
 * Padding from the top of the node
*/
export const NE_CONNECTOR_PAD_TOP = 8;
/**
 * 
*/
export const NE_BODY_PANEL_COLOR = '#ffffff';
export const NE_BODY_PANEL_OPACITY = 1;//0.4;

export const NE_STAGE : EditorStage = new EditorStage();
// Expose variables to console through this
//@ts-ignore
window.dbg_stage = NE_STAGE;