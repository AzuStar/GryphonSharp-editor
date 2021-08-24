import { Vector2d } from "konva/lib/types";
import { VSCShell } from "./vscShell";

export class Utils {
    public static getConnectorPoints(from: Vector2d, to: Vector2d) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        let angle = Math.atan2(-dy, dx);

        const radius = 1;

        return [
            from.x + -radius * Math.cos(angle + Math.PI),
            from.y + radius * Math.sin(angle + Math.PI),
            to.x + -radius * Math.cos(angle),
            to.y + radius * Math.sin(angle),
        ];
    }
}
