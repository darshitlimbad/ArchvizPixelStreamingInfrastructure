// Copyright Epic Games, Inc. All Rights Reserved.
/**
 * Enhanced Device detection utility for Pixel Streaming
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
    browserVersion: string;
    osName: string;
    osVersion: string;
    deviceBrand: string;
    deviceModel: string;
    deviceType: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'wearable' | 'console' | 'unknown';
    connectionType: string;
    connectionSpeed: string;
    timestamp: number;
    deviceId: string;
    orientation: string;
    maxTouchPoints: number;
    hardwareConcurrency: number;
    colorDepth: number;
    pixelDepth: number;
}

export class DeviceDetector {
    private static deviceId: string = '';

    public static getDeviceInfo(): DeviceInfo {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;

        if (!this.deviceId) {
            this.deviceId = this.generateDeviceId();
        }

        const osInfo = this.getOSInfo();
        const browserInfo = this.getBrowserInfo();
        const deviceInfo = this.getDeviceTypeInfo();
        const connectionInfo = this.getConnectionInfo();

        return {
            platform: platform,
            userAgent: userAgent,
            touchSupported: this.isTouchDevice(),
            screenWidth: screen.width,
            screenHeight: screen.height,
            devicePixelRatio: window.devicePixelRatio || 1,
            isMobile: deviceInfo.isMobile,
            isTablet: deviceInfo.isTablet,
            browserName: browserInfo.name,
            browserVersion: browserInfo.version,
            osName: osInfo.name,
            osVersion: osInfo.version,
            deviceBrand: deviceInfo.brand,
            deviceModel: deviceInfo.model,
            deviceType: deviceInfo.type,
            connectionType: connectionInfo.type,
            connectionSpeed: connectionInfo.speed,
            timestamp: Date.now(),
            deviceId: this.deviceId,
            orientation: this.getOrientation(),
            maxTouchPoints: navigator.maxTouchPoints || 0,
            hardwareConcurrency: navigator.hardwareConcurrency || 0,
            colorDepth: screen.colorDepth || 0,
            pixelDepth: screen.pixelDepth || 0
        };
    }

    private static isTouchDevice(): boolean {
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            'ontouchstart' in document.documentElement ||
            ((window as any).DocumentTouch && document instanceof (window as any).DocumentTouch)
        );
    }

    private static getOSInfo(): { name: string; version: string } {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;

        // Android detection (prioritize userAgent over platform for mobile)
        if (/Android/i.test(userAgent)) {
            const match = userAgent.match(/Android\s+([\d.]+)/i);
            return {
                name: 'Android',
                version: match ? match[1] : 'Unknown'
            };
        }

        // iOS detection
        if (/iPad|iPhone|iPod/i.test(userAgent) || (/Mac OS X/i.test(userAgent) && this.isTouchDevice())) {
            const match = userAgent.match(/OS\s+([\d_]+)/i);
            const version = match ? match[1].replace(/_/g, '.') : 'Unknown';

            if (/iPad/i.test(userAgent) || (platform === 'MacIntel' && this.isTouchDevice())) {
                return { name: 'iPadOS', version };
            } else if (/iPhone|iPod/i.test(userAgent)) {
                return { name: 'iOS', version };
            }
        }

        // macOS detection
        if (/Mac OS X/i.test(userAgent) && !this.isTouchDevice()) {
            const match = userAgent.match(/Mac OS X\s+([\d_]+)/i);
            const version = match ? match[1].replace(/_/g, '.') : 'Unknown';
            return { name: 'macOS', version };
        }

        // Windows detection
        if (/Windows NT/i.test(userAgent) || platform.includes('Win')) {
            const match = userAgent.match(/Windows NT\s+([\d.]+)/i);
            let version = 'Unknown';
            if (match) {
                const ntVersion = match[1];
                const windowsVersionMap: { [key: string]: string } = {
                    '10.0': '10/11',
                    '6.3': '8.1',
                    '6.2': '8',
                    '6.1': '7',
                    '6.0': 'Vista',
                    '5.2': 'XP',
                    '5.1': 'XP',
                    '5.0': '2000'
                };
                version = windowsVersionMap[ntVersion] || ntVersion;
            }
            return { name: 'Windows', version };
        }

        // Linux detection (only for desktop Linux, not Android)
        if (platform.includes('Linux') && !/Android/i.test(userAgent)) {
            return { name: 'Linux', version: 'Unknown' };
        }

        // Chrome OS
        if (/CrOS/i.test(userAgent)) {
            const match = userAgent.match(/CrOS\s+\w+\s+([\d.]+)/i);
            return { name: 'Chrome OS', version: match ? match[1] : 'Unknown' };
        }

        return { name: 'Unknown', version: 'Unknown' };
    }

    private static getBrowserInfo(): { name: string; version: string } {
        const userAgent = navigator.userAgent;

        // Edge (Chromium-based)
        if (/Edg\//i.test(userAgent)) {
            const match = userAgent.match(/Edg\/([\d.]+)/i);
            return { name: 'Edge', version: match ? match[1] : 'Unknown' };
        }

        // Chrome
        if (/Chrome\//i.test(userAgent) && !/Edg\//i.test(userAgent)) {
            const match = userAgent.match(/Chrome\/([\d.]+)/i);
            return { name: 'Chrome', version: match ? match[1] : 'Unknown' };
        }

        // Firefox
        if (/Firefox\//i.test(userAgent)) {
            const match = userAgent.match(/Firefox\/([\d.]+)/i);
            return { name: 'Firefox', version: match ? match[1] : 'Unknown' };
        }

        // Safari (not Chrome-based)
        if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) {
            const match = userAgent.match(/Version\/([\d.]+)/i);
            return { name: 'Safari', version: match ? match[1] : 'Unknown' };
        }

        // Opera
        if (/Opera|OPR\//i.test(userAgent)) {
            const match = userAgent.match(/(?:Opera|OPR)\/([\d.]+)/i);
            return { name: 'Opera', version: match ? match[1] : 'Unknown' };
        }

        // Samsung Internet
        if (/SamsungBrowser\//i.test(userAgent)) {
            const match = userAgent.match(/SamsungBrowser\/([\d.]+)/i);
            return { name: 'Samsung Internet', version: match ? match[1] : 'Unknown' };
        }

        return { name: 'Unknown', version: 'Unknown' };
    }

    private static getDeviceTypeInfo(): {
        isMobile: boolean;
        isTablet: boolean;
        type: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'wearable' | 'console' | 'unknown';
        brand: string;
        model: string;
    } {
        const userAgent = navigator.userAgent;

        // TV detection
        if (
            /TV|SMART-TV|SmartTV|GoogleTV|AppleTV|HbbTV|NetCast|NETTV|Roku|PlayStation|Xbox/i.test(userAgent)
        ) {
            return {
                isMobile: false,
                isTablet: false,
                type: 'tv',
                brand: this.extractBrand(userAgent),
                model: 'TV'
            };
        }

        // Console detection
        if (/PlayStation|Xbox|Nintendo/i.test(userAgent)) {
            return {
                isMobile: false,
                isTablet: false,
                type: 'console',
                brand: this.extractConsoleBrand(userAgent),
                model: this.extractConsoleModel(userAgent)
            };
        }

        // Wearable detection
        if (/Watch|wearable/i.test(userAgent)) {
            return {
                isMobile: true,
                isTablet: false,
                type: 'wearable',
                brand: this.extractBrand(userAgent),
                model: 'Wearable'
            };
        }

        // Tablet detection (improved)
        const isTablet = this.isTabletDevice();
        if (isTablet) {
            return {
                isMobile: false,
                isTablet: true,
                type: 'tablet',
                brand: this.extractBrand(userAgent),
                model: this.extractModel(userAgent)
            };
        }

        // Mobile detection (improved)
        const isMobile = this.isMobileDevice();
        if (isMobile) {
            return {
                isMobile: true,
                isTablet: false,
                type: 'mobile',
                brand: this.extractBrand(userAgent),
                model: this.extractModel(userAgent)
            };
        }

        // Desktop
        return {
            isMobile: false,
            isTablet: false,
            type: 'desktop',
            brand: 'Unknown',
            model: 'Desktop'
        };
    }

    private static isMobileDevice(): boolean {
        const userAgent = navigator.userAgent;
        return /Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|webOS|Windows Phone/i.test(
            userAgent
        );
    }

    private static isTabletDevice(): boolean {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;

        // iPad detection (including M1 iPad Pro which reports as Mac)
        if (/iPad/i.test(userAgent) || (platform === 'MacIntel' && this.isTouchDevice())) {
            return true;
        }

        // Android tablets (Android without Mobile in userAgent)
        if (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent)) {
            return true;
        }

        // Windows tablets
        if (/Windows.*Touch/i.test(userAgent) || /Tablet PC/i.test(userAgent)) {
            return true;
        }

        return false;
    }

    private static extractBrand(userAgent: string): string {
        const brands = {
            Samsung: /Samsung|SM-|GT-/i,
            Apple: /iPhone|iPad|iPod/i,
            Google: /Pixel|Nexus/i,
            Huawei: /Huawei|Honor/i,
            Xiaomi: /Xiaomi|Mi |Redmi|POCOPHONE/i,
            OnePlus: /OnePlus|ONEPLUS/i,
            LG: /LG-|LGE/i,
            Sony: /Sony|Xperia/i,
            HTC: /HTC/i,
            Motorola: /Motorola|Moto/i,
            Nokia: /Nokia/i,
            Oppo: /OPPO/i,
            Vivo: /vivo/i,
            Realme: /RMX|RealMe/i
        };

        for (const [brand, pattern] of Object.entries(brands)) {
            if (pattern.test(userAgent)) {
                return brand;
            }
        }

        return 'Unknown';
    }

    private static extractModel(userAgent: string): string {
        // Samsung models
        const samsungMatch = userAgent.match(/(SM-[A-Z0-9]+|GT-[A-Z0-9]+)/i);
        if (samsungMatch) return samsungMatch[1];

        // iPhone models
        const iphoneMatch = userAgent.match(/iPhone(\d+,\d+)/i);
        if (iphoneMatch) return `iPhone ${iphoneMatch[1]}`;

        // Google Pixel
        const pixelMatch = userAgent.match(/Pixel\s?(\w+)/i);
        if (pixelMatch) return `Pixel ${pixelMatch[1]}`;

        // Generic model extraction
        const modelMatch = userAgent.match(/([A-Z0-9-]+)\s+Build/i);
        if (modelMatch) return modelMatch[1];

        return 'Unknown';
    }

    private static extractConsoleBrand(userAgent: string): string {
        if (/PlayStation/i.test(userAgent)) return 'Sony';
        if (/Xbox/i.test(userAgent)) return 'Microsoft';
        if (/Nintendo/i.test(userAgent)) return 'Nintendo';
        return 'Unknown';
    }

    private static extractConsoleModel(userAgent: string): string {
        if (/PlayStation 5|PS5/i.test(userAgent)) return 'PlayStation 5';
        if (/PlayStation 4|PS4/i.test(userAgent)) return 'PlayStation 4';
        if (/Xbox Series|XboxGameOS/i.test(userAgent)) return 'Xbox Series X/S';
        if (/Xbox One/i.test(userAgent)) return 'Xbox One';
        if (/Nintendo Switch/i.test(userAgent)) return 'Nintendo Switch';
        return 'Console';
    }

    private static getConnectionInfo(): { type: string; speed: string } {
        const nav = navigator as any;
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

        if (connection) {
            return {
                type: connection.effectiveType || connection.type || 'unknown',
                speed: connection.downlink ? `${connection.downlink} Mbps` : 'unknown'
            };
        }

        return { type: 'unknown', speed: 'unknown' };
    }

    private static getOrientation(): string {
        if (screen.orientation) {
            return screen.orientation.type;
        }

        const orientation = window.orientation;
        if (orientation !== undefined) {
            return Math.abs(orientation) === 90 ? 'landscape' : 'portrait';
        }

        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }

    private static generateDeviceId(): string {
        // Enhanced device fingerprinting
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Device fingerprint 🔒', 2, 2);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.2)';
            ctx.fillText('Device fingerprint 🔒', 4, 4);
        }

        const canvasFingerprint = canvas.toDataURL();

        // Combine multiple sources for fingerprinting
        const fingerprints = [
            canvasFingerprint,
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            screen.colorDepth.toString(),
            new Date().getTimezoneOffset().toString(),
            navigator.platform,
            navigator.cookieEnabled.toString(),
            navigator.hardwareConcurrency?.toString() || '0'
        ];

        const combinedFingerprint = fingerprints.join('|');
        const hash = this.simpleHash(combinedFingerprint);

        return `device_${hash}`;
    }

    private static simpleHash(str: string): string {
        let hash = 0;
        if (str.length === 0) return hash.toString(36);

        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return Math.abs(hash).toString(36);
    }
}
