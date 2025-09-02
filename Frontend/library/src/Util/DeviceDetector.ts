// Copyright Epic Games, Inc. All Rights Reserved.
/**
 * Device detection utility for Pixel Streaming
 */
export interface DeviceInfo {
    platform: string;
    userAgent: string;
    touchSupported: boolean;
    screenWidth: number;
    screenHeight: number;
    devicePixelRatio: number;
    isMobile: boolean;
    isTablet: boolean;
    browserName: string;
    osName: string;
    connectionType: string;
    timestamp: number;
    deviceId: string;
}

export class DeviceDetector {
    private static deviceId: string = '';

    public static getDeviceInfo(): DeviceInfo {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;

        if (!this.deviceId) {
            this.deviceId = this.generateDeviceId();
        }

        return {
            platform: platform,
            userAgent: userAgent,
            touchSupported: this.isTouchDevice(),
            screenWidth: screen.width,
            screenHeight: screen.height,
            devicePixelRatio: window.devicePixelRatio || 1,
            isMobile: this.isMobileDevice(),
            isTablet: this.isTabletDevice(),
            browserName: this.getBrowserName(),
            osName: this.getOSName(),
            connectionType: this.getConnectionType(),
            timestamp: Date.now(),
            deviceId: this.deviceId
        };
    }

    private static isTouchDevice(): boolean {
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            // Alternative check for older browsers
            'ontouchstart' in document.documentElement
        );
    }

    private static isMobileDevice(): boolean {
        const userAgent = navigator.userAgent;
        return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    }

    private static isTabletDevice(): boolean {
        const userAgent = navigator.userAgent;
        return /iPad|Android(?!.*Mobile)/i.test(userAgent);
    }

    private static getBrowserName(): string {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Edg')) return 'Edge';
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Safari')) return 'Safari';
        return 'Unknown';
    }

    private static getOSName(): string {
        const platform = navigator.platform;
        const userAgent = navigator.userAgent;

        if (platform.includes('Win')) return 'Windows';
        if (platform.includes('Mac')) return 'macOS';
        if (platform.includes('Linux')) return 'Linux';
        if (platform.includes('iPhone') || platform.includes('iPad')) return 'iOS';
        if (/Android/i.test(userAgent)) return 'Android';
        return 'Unknown';
    }

    private static getConnectionType(): string {
        const nav = navigator as any;
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
        return connection ? connection.effectiveType || 'unknown' : 'unknown';
    }

    private static generateDeviceId(): string {
        // Generate a semi-persistent device ID
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx!.textBaseline = 'top';
        ctx!.font = '14px Arial';
        ctx!.fillText('Device fingerprint', 2, 2);

        const fingerprint = canvas.toDataURL();
        const hash = this.simpleHash(fingerprint + navigator.userAgent + screen.width + screen.height);

        return `device_${hash}`;
    }

    private static simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
}
