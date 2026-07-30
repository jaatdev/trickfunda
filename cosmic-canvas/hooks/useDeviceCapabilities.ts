'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface DeviceCapabilities {
    /** True if the device is primarily touch-based (tablet/phone with no mouse) */
    isTouchDevice: boolean;
    /** True if a stylus/pen has been detected (e.g., Apple Pencil, S Pen) */
    hasStylusCapability: boolean;
    /** True if the screen width is <= 1024px (tablet/phone viewport) */
    isMobile: boolean;
    /** True if stylus is actively being used (enables palm rejection on hybrid devices) */
    isStylusActive: boolean;
}

/**
 * useDeviceCapabilities - Device-Aware Input Detection
 * 
 * Detects whether the user is on a touch-only device (Android tablet, iPad, phone)
 * vs. a desktop/laptop with a pen tablet.
 * 
 * Strategy:
 * - Touch-only: `maxTouchPoints > 0` AND no fine pointer (no mouse/trackpad)
 * - Mobile: viewport width <= 1024px
 * - Stylus: detected dynamically from first `pointerdown` event
 * - Stylus active: when pen is detected, re-enables palm rejection on hybrid devices
 * 
 * This is the SINGLE SOURCE OF TRUTH for all conditional input logic.
 */
export function useDeviceCapabilities(): DeviceCapabilities {
    const [state, setState] = useState<DeviceCapabilities>({
        isTouchDevice: false,
        hasStylusCapability: false,
        isMobile: false,
        isStylusActive: false,
    });

    // Track if stylus was seen recently (for palm rejection on hybrid devices)
    const stylusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Detect device capabilities on mount
    useEffect(() => {
        const detectDevice = () => {
            // Check for touch support
            const hasTouchPoints = navigator.maxTouchPoints > 0;
            
            // Check if the primary pointer is coarse (finger) vs fine (mouse/trackpad)
            const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
            const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
            
            // A touch device has touch points AND either:
            // 1. No fine pointer (pure tablet/phone), OR
            // 2. Coarse pointer is primary (tablet-first device)
            // Note: Laptops with touchscreens have BOTH fine and coarse pointers,
            // but fine is primary — so they correctly detect as non-touch devices.
            const isTouchDevice = hasTouchPoints && (!hasFinePointer || (hasCoarsePointer && !hasFinePointer));
            
            // Mobile = narrow viewport (also covers phones)
            const isMobile = window.innerWidth <= 1024;

            setState(prev => ({
                ...prev,
                isTouchDevice,
                isMobile,
            }));
        };

        detectDevice();

        // Re-check on resize (e.g., orientation change on tablets)
        const handleResize = () => {
            setState(prev => ({
                ...prev,
                isMobile: window.innerWidth <= 1024,
            }));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Detect stylus dynamically from pointer events
    useEffect(() => {
        const handlePointerDown = (e: PointerEvent) => {
            if (e.pointerType === 'pen') {
                // Stylus detected! Enable palm rejection for this session
                setState(prev => ({
                    ...prev,
                    hasStylusCapability: true,
                    isStylusActive: true,
                }));

                // Keep stylus active for 3 seconds after last pen event
                // This prevents finger touches during active pen use
                if (stylusTimeoutRef.current) {
                    clearTimeout(stylusTimeoutRef.current);
                }
                stylusTimeoutRef.current = setTimeout(() => {
                    setState(prev => ({
                        ...prev,
                        isStylusActive: false,
                    }));
                }, 3000);
            }
        };

        window.addEventListener('pointerdown', handlePointerDown, { passive: true });
        return () => {
            window.removeEventListener('pointerdown', handlePointerDown);
            if (stylusTimeoutRef.current) {
                clearTimeout(stylusTimeoutRef.current);
            }
        };
    }, []);

    return state;
}

/**
 * shouldAcceptPointerEvent - Determines if a pointer event should be processed for drawing
 * 
 * Rules:
 * 1. Desktop (pen tablet): ONLY accept 'pen' and 'mouse' (palm rejection)
 * 2. Touch device WITHOUT stylus: Accept 'touch', 'pen', and 'mouse'
 * 3. Touch device WITH active stylus: ONLY accept 'pen' (smart palm rejection)
 * 4. Touch device WITH stylus but inactive: Accept 'touch', 'pen', and 'mouse'
 */
export function shouldAcceptPointerEvent(
    pointerType: string,
    capabilities: DeviceCapabilities
): boolean {
    const { isTouchDevice, isStylusActive } = capabilities;

    // Always accept pen and mouse
    if (pointerType === 'pen' || pointerType === 'mouse') return true;

    // Touch events
    if (pointerType === 'touch') {
        // Desktop: block touch (palm rejection for pen tablets)
        if (!isTouchDevice) return false;

        // Touch device with active stylus: block touch (smart palm rejection)
        if (isStylusActive) return false;

        // Touch device without active stylus: accept touch
        return true;
    }

    return false;
}

export default useDeviceCapabilities;
