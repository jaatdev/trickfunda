/**
 * CanvasUtils.ts
 * Helper for coordinate normalization.
 * Translates Window Coordinates (clientX/Y) to Canvas Coordinates.
 */

export function getCanvasPoint(e: PointerEvent | React.PointerEvent, canvas: HTMLElement) {
    const rect = canvas.getBoundingClientRect();

    // Scale factors (Canvas resolution / Display size)
    // Use offsetWidth (CSS width) to get Logical Coordinates.
    // We avoid using canvas.width because that is the Physical Buffer size (DPR scaled),
    // and our renderers usually strictly apply DPR transform themselves.
    const scaleX = canvas.offsetWidth / rect.width;
    const scaleY = canvas.offsetHeight / rect.height;

    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}



export function getPointerPosition(
    e: PointerEvent | React.PointerEvent, 
    canvas: HTMLElement | null, 
    zoom: number = 1
) {
    if (!canvas) return { x: e.clientX, y: e.clientY };
    const rect = canvas.getBoundingClientRect();
    
    // Calculate raw screen coordinate relative to the container
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Apply zoom to get the true intrinsic canvas coordinate
    return {
        x: screenX / zoom,
        y: screenY / zoom
    };
}
