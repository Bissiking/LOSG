// src/App.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock, ExternalLink, Gamepad2, Home, Library, Maximize, Music2, Play, Settings } from 'lucide-react';
import { GAMES, type Game } from './config/games';
import { GameArt, GameBackdrop } from './components/GameArt';
import { Player } from './components/Player';
import { Controllers } from './components/Controllers';
import { BootScreen } from './components/BootScreen';
import { AnimatedLogo } from './components/AnimatedLogo';
import { useGamepad, type PadAction } from './hooks/useGamepad';
import { usePrefs, type LaunchPref } from './hooks/usePrefs';
import { useStartup } from './hooks/useStartup';
import { useControllers } from './hooks/useControllers';
import { openGameTab, resolveGameUrl } from './lib/launch';

type Screen = 'home' | 'library' | 'settings';
const SCREENS: { id: Screen; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'library', label: 'Bibliothèque', icon: Library },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const controllers = useControllers();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState<Game | null>(null);
  const [prefs, setPref] = usePrefs();
  const [now, setNow] = useState(new Date());
  const [notice, setNotice] = useState('');
  const [padFocus, setPadFocus] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const shell = useRef<HTMLDivElement>(null);
  const game = GAMES[index];
  const animate = prefs.animations && !reducedMotion;
  const { phase: startupPhase, booting, markReady, skip: skipStartup } = useStartup(animate);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => { clearInterval(timer); media.removeEventListener('change', update); };
  }, []);

  const navigate = useCallback((next: Screen) => { setScreen(next); setNotice(''); }, []);
  const closePlayer = useCallback(() => setPlaying(null), []);
  const select = useCallback((i: number) => {
    if (!GAMES.length) return;
    setIndex((i + GAMES.length) % GAMES.length);
    setNotice('');
  }, []);

  useEffect(() => {
    shell.current?.querySelector('.carousel .selected')?.scrollIntoView({
      inline: 'nearest', block: 'nearest', behavior: animate ? 'smooth' : 'instant',
    });
  }, [index, screen, animate]);

  const launch = useCallback((selected: Game) => {
    const url = resolveGameUrl(selected.url, window.location.href);
    if (!url) { setNotice('Adresse du jeu invalide. Vérifiez son URL dans le catalogue.'); return; }
    const mode = prefs.launch === 'default' ? selected.launchMode : prefs.launch;
    if (mode === 'newTab') {
      setNotice(openGameTab(url) ? '' : 'Le navigateur a bloqué le nouvel onglet. Autorisez les fenêtres pour ce site, puis réessayez.');
    } else { setNotice(''); setPlaying({ ...selected, url }); }
  }, [prefs.launch]);

  // Scope arrows to cards/navigation. Native form controls retain their keyboard behavior.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (booting) {
        if (event.key === 'Escape') { event.preventDefault(); skipStartup(); }
        return;
      }
      if (playing || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) return;
      const group = active.closest<HTMLElement>('[data-focus-group]');
      if (group && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
        const items = Array.from(group.querySelectorAll<HTMLButtonElement>('button'));
        const current = items.indexOf(active as HTMLButtonElement);
        const vertical = event.key === 'ArrowUp' || event.key === 'ArrowDown';
        if (vertical && !group.classList.contains('grid')) return;
        const columns = group.classList.contains('grid') ? getComputedStyle(group).gridTemplateColumns.split(' ').length : 1;
        const step = vertical ? columns : 1;
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
          : (current + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? step : -step) + items.length) % items.length;
        event.preventDefault(); items[next]?.focus();
      } else if (active === document.body && screen === 'home' && game) {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault(); select(index + (event.key === 'ArrowRight' ? 1 : -1));
        } else if (event.key === 'Enter' && !event.repeat) launch(game);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game, index, launch, playing, screen, select, booting, skipStartup]);

  const onPad = (action: PadAction) => {
    if (action === 'pause') return;
    if (booting) { if (action === 'accept' || action === 'back') skipStartup(); return; }
    setPadFocus(true);
    if (action === 'back') { navigate('home'); return; }
    if (action === 'previous' || action === 'next') {
      const next = (SCREENS.findIndex((s) => s.id === screen) + (action === 'next' ? 1 : 2)) % 3;
      navigate(SCREENS[next].id);
      shell.current?.querySelector<HTMLButtonElement>(`[data-screen="${SCREENS[next].id}"]`)?.focus();
      return;
    }
    const active = document.activeElement;
    const controls = Array.from(shell.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, a[href]') ?? [])
      .filter((el) => el.getClientRects().length);
    if (action === 'accept') {
      if (active instanceof HTMLSelectElement) {
        const next = active.options[(active.selectedIndex + 1) % active.options.length];
        setPref('launch', next.value as LaunchPref);
      } else if (active instanceof HTMLElement && controls.includes(active)) {
        const selected = active.dataset.gameIndex;
        if (screen === 'home' && selected !== undefined && GAMES[Number(selected)]) launch(GAMES[Number(selected)]);
        else active.click();
      } else shell.current?.querySelector<HTMLButtonElement>('.play, nav button')?.focus();
      return;
    }
    if (!(active instanceof HTMLElement) || !controls.includes(active)) { controls[0]?.focus(); return; }
    const rect = active.getBoundingClientRect();
    const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
    const horizontal = action === 'left' || action === 'right';
    const sign = action === 'left' || action === 'up' ? -1 : 1;
    const candidates = controls.filter((el) => el !== active).map((el) => {
      const box = el.getBoundingClientRect();
      const dx = box.x + box.width / 2 - x, dy = box.y + box.height / 2 - y;
      const forward = (horizontal ? dx : dy) * sign;
      return { el, forward, score: forward + Math.abs(horizontal ? dy : dx) * 3 };
    }).filter((item) => item.forward > 8).sort((a, b) => a.score - b.score);
    candidates[0]?.el.focus();
  };
  const padConnected = useGamepad(!playing, onPad);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else setNotice('Le plein écran n’est pas disponible dans ce navigateur.');
    } catch { setNotice('Le plein écran a été refusé par le navigateur. Vous pouvez réessayer.'); }
  };

  return (
    <div className={`app ${animate ? '' : 'no-anim'} ${prefs.glow ? '' : 'no-glow'} ${padFocus ? 'pad-focus' : ''} screen-${screen}`}
      onPointerDownCapture={() => setPadFocus(false)} onKeyDownCapture={() => setPadFocus(false)}>
      <GameBackdrop game={game} onReady={markReady} /><div className="veil" />
      {booting && <BootScreen phase={startupPhase} animated={animate} onSkip={skipStartup} />}
      <div className="shell" ref={shell} {...(booting ? { inert: '' } : {})} aria-hidden={booting || undefined}>
        <a className="skip-link" href="#main">Aller au contenu</a>
        <header className="topbar">
          <div className="brand" aria-label="LUMA OS: Gaming">
            <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
            <span><span className="logo">LOSG</span></span>
          </div>
          <nav aria-label="Navigation principale" data-focus-group>
            {SCREENS.map(({ id, label, icon: Icon }) => (
              <button key={id} data-screen={id} className={screen === id ? 'active' : ''}
                aria-current={screen === id ? 'page' : undefined} onClick={() => navigate(id)}>
                <Icon size={17} aria-hidden="true" /><span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="system-status"><button className="controller-status" onClick={() => navigate('settings')} aria-label={`${controllers.length} manette(s) détectée(s), voir les joueurs`}><Gamepad2 size={18} /><span>{controllers.length}</span></button><span className="spx-wordmark" aria-label="SPX">SPX<span aria-hidden="true">/</span></span>
            <div className="clock"><Clock size={15} aria-hidden="true" />
              <time dateTime={now.toISOString()}>{now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</time>
            </div>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {screen === 'home' && game && (
            <section className="home" aria-label="Accueil des applications">
              <div className="info" key={game.id}>
                <h1>{game.name}</h1>
                <div className="game-meta"><span>{game.kind === 'music'
                  ? <><Music2 size={15} aria-hidden="true" /> Application musicale</>
                  : <><Gamepad2 size={15} aria-hidden="true" /> {game.local ? 'Inclus dans LOSG' : 'Jeu web'}</>}</span>
                  {game.demo && <span className="demo-label">Démonstration</span>}</div>
                <p>{game.description}</p>
                <div className="hero-actions"><button className="play" onClick={() => launch(game)} aria-label={`${game.kind === 'music' ? 'Ouvrir' : 'Jouer à'} ${game.name}`}>
                  {game.kind === 'music' ? <Music2 size={18} aria-hidden="true" /> : <Play size={18} fill="currentColor" aria-hidden="true" />}
                  {game.kind === 'music' ? 'Ouvrir' : 'Jouer'}</button>
                  <span className="launch-hint">{(prefs.launch === 'default' ? game.launchMode : prefs.launch) === 'newTab'
                    ? <><ExternalLink size={14} aria-hidden="true" /> Nouvel onglet</> : 'Vue intégrée'}</span></div>
              </div>
              <div className="collection">
                <div className="section-line"><h2>Votre collection</h2><span className="collection-count">{GAMES.length} applications</span>
                  <div className="carousel-controls"><button className="icon-button" aria-label="Application précédente" onClick={() => select(index - 1)}><ArrowLeft size={17} /></button>
                    <button className="icon-button" aria-label="Application suivante" onClick={() => select(index + 1)}><ArrowRight size={17} /></button></div></div>
                <div className="carousel" data-focus-group aria-label="Sélection des applications">
                  {GAMES.map((g, i) => <button key={g.id} data-game-index={i} className={`card ${i === index ? 'selected' : ''}`}
                    aria-pressed={i === index} aria-label={`${g.name}${g.demo ? ', démonstration' : ''}`}
                    onFocus={() => select(i)} onClick={() => select(i)}
                    onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); if (!event.repeat) launch(g); } }}>
                    <span className="cover"><GameArt game={g} eager={i === 0} />{g.demo && <span className="cover-label">DÉMO</span>}
                      {i === index && <span className="selection-mark"><Check size={14} /></span>}</span>
                    <span className="card-caption"><span>{g.name}</span><span className="card-state">{i === index ? 'Sélectionné' : 'Sélectionner'}</span></span>
                  </button>)}
                </div>
                <button className="text-button library-link" onClick={() => navigate('library')}>Voir la bibliothèque <ChevronRight size={16} /></button>
              </div>
            </section>
          )}
          {screen === 'home' && !game && <section className="empty-state"><Gamepad2 size={40} /><h1>Votre prochain univers vous attend.</h1><p>Ajoutez vos jeux dans le catalogue pour commencer.</p></section>}
          {screen === 'library' && <section className="library-page" aria-labelledby="library-title">
            <div className="page-heading"><h1 id="library-title">Bibliothèque</h1><p>Tous vos univers, au même endroit. <span>{GAMES.length} applications</span></p></div>
            {GAMES.length ? <div className="grid" data-focus-group>{GAMES.map((g, i) => (
              <button key={g.id} data-game-index={i} className={`library-card ${i === index ? 'selected' : ''}`}
                aria-label={`Sélectionner ${g.name}`} onFocus={() => select(i)}
                onClick={() => { select(i); navigate('home'); requestAnimationFrame(() => shell.current?.querySelector<HTMLButtonElement>('.play')?.focus()); }}>
                <span className="cover"><GameArt game={g} />{g.demo && <span className="cover-label">DÉMO</span>}</span>
                <span className="library-caption"><strong>{g.name}</strong><ChevronRight size={18} /></span>
                <span className="library-description">{g.description}</span>
              </button>))}</div> : <p className="empty-state">Aucun jeu. Ajoutez une entrée dans le catalogue.</p>}
            {GAMES.some((g) => g.demo) && <p className="catalogue-note">Les entrées marquées « Démo » et leurs illustrations sont fictives.</p>}
          </section>}
          {screen === 'settings' && <section className="settings-page" aria-labelledby="settings-title">
            <div className="page-heading"><h1 id="settings-title">Paramètres</h1><p>Votre espace de jeu, à votre rythme.</p></div>
            <div className="settings-layout"><div className="panel">
              <label className="row"><span><strong>Animations</strong><small>{reducedMotion ? 'Réduction des animations activée sur votre appareil.' : 'Transitions entre les jeux et les écrans.'}</small></span>
                <input type="checkbox" role="switch" checked={prefs.animations} onChange={(e) => setPref('animations', e.target.checked)} /></label>
              <label className="row"><span><strong>Effets lumineux</strong><small>Une lumière discrète sur le jeu sélectionné.</small></span>
                <input type="checkbox" role="switch" checked={prefs.glow} onChange={(e) => setPref('glow', e.target.checked)} /></label>
              <label className="row"><span><strong>Lancement des jeux</strong><small>Choisissez comment ouvrir vos jeux.</small></span>
                <select value={prefs.launch} onChange={(e) => setPref('launch', e.target.value as LaunchPref)}>
                  <option value="default">Selon le jeu</option><option value="embed">Vue intégrée</option><option value="newTab">Nouvel onglet</option></select></label>
              <div className="row"><span><strong>Plein écran</strong><small>Profitez de tout votre écran.</small></span>
                <button className="btn" onClick={() => void toggleFullscreen()}><Maximize size={16} /> Basculer</button></div>
            </div><aside className="settings-about"><AnimatedLogo animated={animate} /><h2>LUMA OS: Gaming</h2><p>Version 0.2.0</p>
              <p>Préférences enregistrées sur ce navigateur lorsque le stockage local est disponible.</p>
              <p><Gamepad2 size={17} /> {padConnected ? 'Manette standard détectée' : 'Manette : connectez-la, puis appuyez sur un bouton.'}</p>
            </aside></div>
            <Controllers />
          </section>}
          <div className="feedback" role="status" aria-live="polite">{notice}</div>
        </main>
        <footer className="footer"><div className="input-hints">{padConnected
          ? <><span><Gamepad2 size={15} /> Stick / croix : naviguer</span><span>A : valider</span><span>B : accueil</span><span>LB / RB : onglets</span></>
          : <><span><kbd>←</kbd><kbd>→</kbd> Parcourir</span><span><kbd>Entrée</kbd> Lancer / valider</span><span><kbd>Tab</kbd> Naviguer</span></>}
        </div><span className="footer-version">LUMA OS <span>0.2.0</span></span></footer>
      </div>
      {playing && <Player game={playing} onClose={closePlayer} />}
    </div>
  );
}
