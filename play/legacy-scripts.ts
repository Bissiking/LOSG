// These games predate ES modules; load their scripts in order in their own document.
export const legacyScripts = {
  '2048': [
    'js/bind_polyfill.js', 'js/classlist_polyfill.js', 'js/animframe_polyfill.js',
    'js/keyboard_input_manager.js', 'js/html_actuator.js', 'js/grid.js',
    'js/tile.js', 'js/local_storage_manager.js', 'js/game_manager.js',
  ],
  hexgl: [
    'libs/Three.dev.js', 'libs/ShaderExtras.js', 'libs/postprocessing/EffectComposer.js',
    'libs/postprocessing/RenderPass.js', 'libs/postprocessing/BloomPass.js',
    'libs/postprocessing/ShaderPass.js', 'libs/postprocessing/MaskPass.js',
    'libs/Detector.js', 'libs/Stats.js', 'libs/DAT.GUI.min.js',
    'bkcore.coffee/controllers/TouchController.js', 'bkcore.coffee/controllers/OrientationController.js',
    'bkcore.coffee/Timer.js', 'bkcore.coffee/ImageData.js', 'bkcore.coffee/Utils.js',
    'bkcore/threejs/RenderManager.js', 'bkcore/threejs/Shaders.js', 'bkcore/threejs/Particles.js',
    'bkcore/threejs/Loader.js', 'bkcore/Audio.js', 'bkcore/hexgl/HUD.js',
    'bkcore/hexgl/RaceData.js', 'bkcore/hexgl/ShipControls.js', 'bkcore/hexgl/ShipEffects.js',
    'bkcore/hexgl/CameraChase.js', 'bkcore/hexgl/Gameplay.js',
    'bkcore/hexgl/tracks/Cityscape.js', 'bkcore/hexgl/HexGL.js',
  ],
} as const;

export async function loadLegacyScripts(game: keyof typeof legacyScripts): Promise<void> {
  for (const file of legacyScripts[game]) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `/play/${game}/${file}`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Chargement impossible : ${file}`));
      document.head.append(script);
    });
  }
}
