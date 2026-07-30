import { useRef, useCallback, RefObject } from 'react';
import { getCanvasPoint } from '../utils/canvasUtils';
import { useDeviceCapabilities, shouldAcceptPointerEvent } from './useDeviceCapabilities';

export interface PenPoint {
    x: number;
    y: number;
    pressure: number;
    time: number;
}

interface UsePenInputProps {
    onPointerDown?: (point: PenPoint) => void;
    onPointerMove?: (points: PenPoint[]) => void;
    onPointerUp?: () => void;
    canvasRef?: RefObject<HTMLCanvasElement | null>; // Optional ref for normalization
}

export const usePenInput = (props?: UsePenInputProps) => {
    const pointsRef = useRef<PenPoint[]>([]);
    const isDrawingRef = useRef(false);
    const deviceCapabilities = useDeviceCapabilities();

    // Helper to get coordinates
    const getPoint = (evt: PointerEvent | React.PointerEvent) => {
        if (props?.canvasRef?.current) {
            const { x, y } = getCanvasPoint(evt, props.canvasRef.current);
            return { x, y };
        }
        return { x: evt.clientX, y: evt.clientY };
    };

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        // Device-aware palm rejection: block touch on desktop, allow on tablets
        if (!shouldAcceptPointerEvent(e.pointerType, deviceCapabilities)) return;

        const target = e.target as HTMLElement;
        target.setPointerCapture(e.pointerId);
        isDrawingRef.current = true;

        // Helper to get coordinates
        const getPoint = (evt: PointerEvent | React.PointerEvent) => {
            if (props?.canvasRef?.current) {
                const { x, y } = getCanvasPoint(evt, props.canvasRef.current);
                return { x, y };
            }
            return { x: evt.clientX, y: evt.clientY };
        };

        const { x, y } = getPoint(e);

        // Use clientX/Y. Pressure fallback if 0 to 0.5 (common for mice)
        const point = {
            x,
            y,
            pressure: e.pressure || 0.5,
            time: e.timeStamp
        };

        // Reset buffer if this is a fresh stroke logic intended
        // But per original Step 1 verification, we kept appending.
        // For Step 4 integration, we likely want to handle stroke start externally 
        // using the onPointerDown callback. 
        // We will keep internal ref behavior consistent with previous step (append).
        pointsRef.current.push(point);

        props?.onPointerDown?.(point);
    }, [props]);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDrawingRef.current) return;
        // Device-aware palm rejection
        if (!shouldAcceptPointerEvent(e.pointerType, deviceCapabilities)) return;

        const newPoints: PenPoint[] = [];

        // The Beast Feature: Coalesced Events
        const nativeEvent = e.nativeEvent;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const coalesced = (nativeEvent as any).getCoalescedEvents
            ? (nativeEvent as any).getCoalescedEvents()
            : [];

        if (coalesced.length > 0) {
            // Iterate through ALL coalesced events
            for (const event of coalesced) {
                const p = getPoint(event);
                newPoints.push({
                    x: p.x,
                    y: p.y,
                    pressure: event.pressure || 0.5,
                    time: event.timeStamp
                });
            }
        } else {
            // Fallback to main event
            const p = getPoint(e);
            newPoints.push({
                x: p.x,
                y: p.y,
                pressure: e.pressure || 0.5,
                time: e.timeStamp
            });
        }

        // Push to internal ref
        pointsRef.current.push(...newPoints);

        // Fire callback with NEW points (for physics/rendering)
        props?.onPointerMove?.(newPoints);

    }, [props]);

    const onPointerUp = useCallback((e: React.PointerEvent) => {
        // Device-aware palm rejection
        if (!shouldAcceptPointerEvent(e.pointerType, deviceCapabilities)) return;

        if (isDrawingRef.current) {
            isDrawingRef.current = false;
            try {
                const target = e.target as HTMLElement;
                target.releasePointerCapture(e.pointerId);
            } catch (err) {
                // Ignore capture release errors on cancel
            }

            props?.onPointerUp?.();
        }
    }, [props]);

    const onPointerCancel = useCallback((e: React.PointerEvent) => {
        // Treat cancel the same as up, to prevent stuck pointers
        onPointerUp(e);
    }, [onPointerUp]);

    return {
        handlers: {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel,
            onPointerOut: onPointerCancel
        },
        pointsRef
    };
};
