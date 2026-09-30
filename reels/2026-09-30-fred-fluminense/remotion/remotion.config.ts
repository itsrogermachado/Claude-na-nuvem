import {Config} from '@remotion/cli/config';

Config.setEntryPoint('src/index.ts');
// Headless container without GPU: SwiftShader through ANGLE for the Three.js scenes
Config.setChromiumOpenGlRenderer('swangle');
// Quality: lossless frame captures, high-bitrate H.264
Config.setVideoImageFormat('png');
Config.setCodec('h264');
Config.setCrf(14);
Config.setX264Preset('slow');
Config.setPixelFormat('yuv420p');
Config.setAudioBitrate('320k');
Config.setConcurrency(4);
