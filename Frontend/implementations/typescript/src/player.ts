// Copyright Epic Games, Inc. All Rights Reserved.

/*  ──────────────────────────────────────────────────────────────
    Global re-exports (kept at top so other scripts can import
    from "player.ts" exactly as before)                         */
export * from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.6';
export * from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.6';

import {
  Config,
  PixelStreaming,
  Logger,
  LogLevel, 
  MessageDirection,
  DeviceInfoSentEvent,
  DeviceInfoRequestedEvent,
  MobileDeviceDetectedEvent,
  DesktopDeviceDetectedEvent,
  DeviceOrientationChangedEvent
} from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.6';
import {
  Application,
  PixelStreamingApplicationStyle
} from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.6';

/*  ──────────────────────────────────────────────────────────────
    UI styles                                                         */
const styles = new PixelStreamingApplicationStyle();
styles.applyStyleSheet();

/*  ──────────────────────────────────────────────────────────────
    Expose PixelStreaming instance on window for easy debugging    */
declare global {
  interface Window {
    pixelStreaming: PixelStreaming;
  }
}

/*  ──────────────────────────────────────────────────────────────
    Main bootstrap                                                  */
document.body.onload = () => {
  /* Verbose logging off by default; set third param to false to hide timestamps */
  Logger.InitLogging(LogLevel.Warning, true);

  /* Build the runtime config (URL ?param=value syntax honoured) */
  const config = new Config({ useUrlParams: true });

  /* Instantiate Pixel Streaming core */
  const stream = new PixelStreaming(config);

  /* Hook custom device-detection events for quick visibility */
  attachDeviceEventLoggers(stream);

  /* Spin-up Epic's default UI shell */
  const app = new Application({
    stream,
    onColorModeChanged: isLight => styles.setColorMode(isLight)
  });
  document.body.appendChild(app.rootElement);

  /* Make it globally reachable (e.g. from dev-tools console) */
  window.pixelStreaming = stream;
};

/*  ──────────────────────────────────────────────────────────────
    Helper: dump all custom device-detection events to console     */
function attachDeviceEventLoggers(stream: PixelStreaming): void {
    // Change all e.detail to e.data to match the Event pattern
    stream.addEventListener('deviceInfoSent', (e: DeviceInfoSentEvent) =>
        console.log('🔄 deviceInfoSent', e.data) // Changed from e.detail
    );

    stream.addEventListener('deviceInfoRequested', (e: DeviceInfoRequestedEvent) =>
        console.log('📱 deviceInfoRequested', e.data) // Changed from e.detail
    );

    stream.addEventListener('mobileDeviceDetected', (e: MobileDeviceDetectedEvent) =>
        console.log('📱 mobileDeviceDetected', e.data) // Changed from e.detail
    );

    stream.addEventListener('desktopDeviceDetected', (e: DesktopDeviceDetectedEvent) =>
        console.log('🖥️ desktopDeviceDetected', e.data) // Changed from e.detail
    );

    stream.addEventListener('deviceOrientationChanged', (e: DeviceOrientationChangedEvent) =>
        console.log('🔄 deviceOrientationChanged', e.data) // Changed from e.detail
    );

  /* connection state helpers */
  stream.addEventListener('webRtcConnected', () =>
    console.log('✅ webRtcConnected – device detection active')
  );
  stream.addEventListener('webRtcDisconnected', () =>
    console.log('❌ webRtcDisconnected')
  );
}