import { Gamepad2, Maximize, Monitor, Play } from 'lucide-react';
import type { Prefs, LaunchPref } from '../hooks/usePrefs';
import type { ControllerInfo } from '../lib/gamepad';
import { AnimatedLogo } from './AnimatedLogo';
import { Controllers } from './Controllers';

interface SettingsPageProps {
  prefs: Prefs;
  reducedMotion: boolean;
  animated: boolean;
  controllers: ControllerInfo[];
  onPrefChange: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
  onFullscreen: () => void;
}

export function SettingsPage({ prefs, reducedMotion, animated, controllers, onPrefChange, onFullscreen }: SettingsPageProps) {
  return <section className="settings-page" aria-labelledby="settings-title">
    <div className="page-heading settings-heading">
      <h1 id="settings-title">Paramètres</h1>
      <p>Votre affichage, vos jeux et vos manettes.</p>
    </div>
    <div className="settings-layout">
      <div className="settings-content">
        <section className="settings-section" aria-labelledby="display-title">
          <h2 id="display-title"><Monitor size={20} aria-hidden="true" /> Affichage</h2>
          <label className="settings-row" htmlFor="pref-animations">
            <span><strong id="animations-label">Animations</strong><small id="animations-help">{reducedMotion ? 'La réduction des animations de votre appareil reste prioritaire.' : 'Transitions entre les jeux et les écrans.'}</small></span>
            <input id="pref-animations" aria-labelledby="animations-label" aria-describedby="animations-help" type="checkbox" role="switch" checked={prefs.animations} onChange={(event) => onPrefChange('animations', event.target.checked)} />
          </label>
          <label className="settings-row" htmlFor="pref-glow">
            <span><strong id="glow-label">Effets lumineux</strong><small id="glow-help">Une lumière discrète autour du jeu sélectionné.</small></span>
            <input id="pref-glow" aria-labelledby="glow-label" aria-describedby="glow-help" type="checkbox" role="switch" checked={prefs.glow} onChange={(event) => onPrefChange('glow', event.target.checked)} />
          </label>
          <div className="settings-row">
            <span><strong>Plein écran</strong><small>Utilisez tout l’espace de votre écran.</small></span>
            <button className="btn" aria-label="Basculer le plein écran" onClick={onFullscreen}><Maximize size={16} aria-hidden="true" /> Basculer</button>
          </div>
        </section>
        <section className="settings-section" aria-labelledby="launch-title">
          <h2 id="launch-title"><Play size={20} aria-hidden="true" /> Lancement des jeux</h2>
          <label className="settings-row" htmlFor="pref-launch">
            <span><strong id="launch-label">Ouvrir les jeux</strong><small id="launch-help">Dans LOSG ou dans un onglet du navigateur.</small></span>
            <select id="pref-launch" aria-labelledby="launch-label" aria-describedby="launch-help" value={prefs.launch} onChange={(event) => onPrefChange('launch', event.target.value as LaunchPref)}>
              <option value="default">Selon le jeu</option><option value="embed">Dans LOSG</option><option value="newTab">Nouvel onglet</option>
            </select>
          </label>
        </section>
        <section className="settings-section settings-controls" aria-labelledby="pad-help-title">
          <h2 id="pad-help-title"><Gamepad2 size={20} aria-hidden="true" /> Naviguer à la manette</h2>
          <dl className="control-guide">
            <div><dt>Croix / stick gauche</dt><dd>Choisir une option</dd></div>
            <div><dt>Stick droit</dt><dd>Faire défiler la page</dd></div>
            <div><dt>A / Croix</dt><dd>Valider ou modifier</dd></div>
            <div><dt>B / Rond</dt><dd>Revenir à l’accueil</dd></div>
            <div><dt>LB / RB</dt><dd>Changer d’onglet</dd></div>
          </dl>
          <p className="system-shortcut">En jeu, maintenez <strong>LB + RB + LT + RT</strong> pour ouvrir le menu LOSG. Au clavier : <kbd>F1</kbd>.</p>
        </section>
      </div>
      <aside className="settings-devices" aria-label="Manettes et joueurs">
        <Controllers controllers={controllers} />
      </aside>
    </div>
    <div className="settings-about">
      <AnimatedLogo animated={animated} />
      <div><h2>LUMA OS: Gaming</h2><p>Version {__LOSG_VERSION__}</p></div>
      <p className="settings-storage">Préférences enregistrées dans ce navigateur lorsque le stockage local est disponible.</p>
    </div>
  </section>;
}
