// Copyright Epic Games, Inc. All Rights Reserved.

/*  ──────────────────────────────────────────────────────────────
    Global re-exports (kept at top so other scripts can import
    from “player.ts” exactly as before)                         */
export * from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.6';
export * from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.6';

import {
  Config,
  PixelStreaming,
  Logger,
  LogLevel, 
  MessageDirection
} from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.6';
import {
  Application,
  PixelStreamingApplicationStyle
} from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.6';
import Stream from 'stream';

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

  /* Spin-up Epic’s default UI shell */
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
  /* deviceInfoSent */
  stream.addEventListener(
    'deviceInfoSent',
    (e: Event & { data: unknown }) =>
      console.log('🔄 deviceInfoSent', e.data)
  );

  /* deviceInfoRequested */
  stream.addEventListener(
    'deviceInfoRequested',
    (e: Event & { data: unknown }) =>
      console.log('📱 deviceInfoRequested', e.data)
  );

  /* mobileDeviceDetected */
  stream.addEventListener(
    'mobileDeviceDetected',
    (e: Event & { data: unknown }) =>
      console.log('📱 mobileDeviceDetected', e.data)
  );

  /* desktopDeviceDetected */
  stream.addEventListener(
    'desktopDeviceDetected',
    (e: Event & { data: unknown }) =>
      console.log('🖥️ desktopDeviceDetected', e.data)
  );

  /* deviceOrientationChanged */
  stream.addEventListener(
    'deviceOrientationChanged',
    (e: Event & { data: unknown }) =>
      console.log('🔄 deviceOrientationChanged', e.data)
  );

  /* connection state helpers */
  stream.addEventListener('webRtcConnected', () =>
    console.log('✅ webRtcConnected – device detection active')
  );
  stream.addEventListener('webRtcDisconnected', () =>
    console.log('❌ webRtcDisconnected')
  );

  // Register handler for 'requestDeviceInfo' messages coming FROM the streamer (UE)
  stream.registerMessageHandler(
      "requestDeviceInfo", 
      MessageDirection.FromStreamer,
      (data: ArrayBuffer) => {
          try {
              // Convert ArrayBuffer to string
              const decoder = new TextDecoder("utf-16");
              const jsonStr = decoder.decode(data.slice(1));
              
              // Parse JSON
              const message = JSON.parse(jsonStr);

              Logger.Info("Get message from the backend, \n Now printing the data in after decoding arraybuffer into \"utf-16\" format and removing the 0 th index as per other registers. ")
              Logger.Info(message);
              
              console.log('📱 UE requested device info:', message);
              
              // Handle the request - send device info back
              this.handleDeviceInfoRequest(message);
              
          } catch (error) {
              console.error('Error parsing requestDeviceInfo message:', error);
          }
      }
  );
}
