"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CanvasColour {
    constructor() {
        this.id = 'canvasColour';
    }
    beforeDraw(chart, _easing, options) {
        if (!options.enabled) {
            return;
        }
        if (!chart.canvas) {
            throw new Error('Canvas is invalid');
        }
        if (!chart.chartArea) {
            throw new Error('ChartArea is invalid');
        }
        // https://stackoverflow.com/questions/38493564/chart-area-background-color-chartjs
        const { canvas, chartArea, ctx } = chart;
        if (!ctx) {
            throw new Error('Context is invalid');
        }
        ctx.save();
        if (options.canvasColour) {
            ctx.fillStyle = options.canvasColour;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (options.borderColour && options.border) {
            ctx.lineWidth = options.border;
            ctx.strokeStyle = options.borderColour;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
        }
        if (options.chartAreaColour) {
            ctx.fillStyle = options.chartAreaColour;
            ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
        }
        ctx.restore();
    }
}
exports.CanvasColour = CanvasColour;
//# sourceMappingURL=canvasColourPlugin.js.map