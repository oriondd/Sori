import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import {
  fallbackProfile,
  FRAME_CSP,
  getSandboxGuardScript,
  PROFILE_MAX_CSS_CHARS,
  PROFILE_MAX_HTML_CHARS,
  PROFILE_MAX_JS_CHARS,
  readProfileVersions,
  readSavedProfile,
  resetProfile,
  sanitizeProfileHtml,
  saveProfile as persistProfile,
  type SavedProfile,
} from '@/lib/profile-security';

type StarterTheme = {
  name: string;
  description: string;
  html: string;
  css: string;
  js: string;
};

const CUSTOM_THEME_NAME = 'Custom Theme';

const starterThemes: StarterTheme[] = [
  {
    name: 'Neon Orbit',
    description: 'Dark MySpace-style profile with neon borders and glowing sections.',
    html: `<canvas id="particles"></canvas>
<main class="sori-page neon">
  <section class="hero">
    <div class="avatar">S</div>
    <div>
      <p class="handle">@your-sori</p>
      <h1>Your story starts here</h1>
      <p class="mood">Mood: building a corner of the internet that feels like me.</p>
    </div>
  </section>
  <section class="panel">
    <h2>About me</h2>
    <p>Write your intro, favorite things, current obsession, and the little details people remember.</p>
  </section>
  <section class="tiles">
    <div>latest photo</div>
    <div>current song</div>
    <div>favorite link</div>
  </section>
</main>`,
    css: `.sori-page {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  padding: 34px;
  background: radial-gradient(circle at top right, rgba(255,60,191,.35), transparent 34%), #090914;
}
#particles {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
}
.hero { display: flex; gap: 20px; align-items: center; }
.avatar {
  width: 118px; height: 118px; border-radius: 28px; display: grid; place-items: center;
  background: white; color: #050509; font-size: 64px; font-weight: 900;
  border: 4px solid #ff3cbf; box-shadow: 0 0 34px rgba(255,60,191,.58);
}
.handle { color: #67e8f9; font-weight: 900; margin: 0 0 6px; }
h1 { font-size: clamp(38px, 7vw, 76px); line-height: .92; margin: 0; }
.mood, p { color: #dbeafe; font-size: 17px; line-height: 1.5; }
.panel, .tiles div {
  border: 1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.07);
  border-radius: 24px; padding: 22px; margin-top: 28px;
}
.panel h2 { margin: 0 0 8px; font-size: 28px; }
.tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.tiles div { min-height: 120px; display: grid; place-items: center; color: white; font-weight: 900; text-transform: uppercase; cursor: grab; }`,
    js: `const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
const dots = Array.from({ length: 42 }, () => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  vx: (Math.random() - 0.5) * 0.45,
  vy: (Math.random() - 0.5) * 0.45,
}));
function sizeCanvas() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
addEventListener('resize', sizeCanvas);
addEventListener('mousemove', (event) => {
  dots[0].x = event.clientX;
  dots[0].y = event.clientY;
});
sizeCanvas();
function animate() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  dots.forEach((dot) => {
    dot.x += dot.vx;
    dot.y += dot.vy;
    if (dot.x < 0 || dot.x > innerWidth) dot.vx *= -1;
    if (dot.y < 0 || dot.y > innerHeight) dot.vy *= -1;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(103,232,249,.7)';
    ctx.fill();
  });
  requestAnimationFrame(animate);
}
animate();`,
  },
  {
    name: 'Clean Creator',
    description: 'Minimal bright personal profile with crisp editorial sections.',
    html: `<main class="sori-page clean">
  <header>
    <p>@your-sori</p>
    <h1>A clean page for the story of you.</h1>
  </header>
  <section class="bio">
    <h2>About me</h2>
    <p>Simple, polished, personal. Add your intro, favorite posts, links, and what you are into right now.</p>
  </section>
  <section class="stack">
    <article>Photos</article>
    <article>Music</article>
    <article>Links</article>
  </section>
</main>`,
    css: `.sori-page {
  min-height: 100vh;
  padding: 46px;
  background: linear-gradient(135deg, #f8fafc, #e0f2fe);
  color: #0f172a;
}
header {
  max-width: 760px;
  padding-bottom: 28px;
  border-bottom: 1px solid #cbd5e1;
}
header p { color: #0284c7; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
h1 { font-size: clamp(42px, 7vw, 82px); line-height: .9; margin: 0; }
.bio {
  margin-top: 28px; max-width: 680px; background: white; border: 1px solid #cbd5e1;
  border-radius: 22px; padding: 26px; box-shadow: 0 24px 70px rgba(15,23,42,.1);
}
.bio h2 { font-size: 30px; margin: 0 0 8px; }
.bio p { color: #334155; font-size: 17px; line-height: 1.6; }
.stack { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 22px; }
article { border-radius: 18px; background: #0f172a; color: white; min-height: 120px; display: grid; place-items: center; font-weight: 900; }`,
    js: '',
  },
  {
    name: 'Retro Web',
    description: 'Chunky classic profile blocks with a modern purple electric palette.',
    html: `<main class="sori-page retro">
  <section class="window">
    <div class="bar">SORI PROFILE 001</div>
    <h1>@your-sori</h1>
    <p>Welcome to my page. Stay awhile.</p>
  </section>
  <section class="columns">
    <div><h2>About me</h2><p>Custom status, favorite music, and whatever belongs on your internet wall.</p></div>
    <div><h2>Now playing</h2><p>Add a song, mood, or personal note here.</p></div>
  </section>
</main>`,
    css: `.sori-page {
  min-height: 100vh;
  padding: 30px;
  background: #1e1033;
  color: white;
  font-family: Verdana, Geneva, sans-serif;
}
.window, .columns div {
  border: 3px solid #f0abfc;
  background: #32184f;
  box-shadow: 10px 10px 0 #a78bfa;
}
.window { padding: 26px; }
.bar { background: #f0abfc; color: #1e1033; padding: 10px 12px; margin: -26px -26px 22px; font-weight: 900; }
h1 { font-size: clamp(38px, 8vw, 88px); margin: 0; text-transform: uppercase; }
p { color: #f5d0fe; font-size: 17px; line-height: 1.55; }
.columns { display: grid; grid-template-columns: 1.3fr 1fr; gap: 22px; margin-top: 30px; }
.columns div { padding: 22px; }
h2 { margin-top: 0; }`,
    js: `document.querySelectorAll('.columns div').forEach((card) => {
  card.addEventListener('click', () => {
    card.style.transform = card.style.transform ? '' : 'rotate(-1deg) scale(1.02)';
  });
});`,
  },
];

const baseFrameStyle = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    background: #090914;
    color: white;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    overflow: hidden;
  }
`;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildPreviewDocument(html: string, css: string, js: string) {
  const profileHtml = sanitizeProfileHtml(html);
  const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${FRAME_CSP}" />`;
  const styleTag = `<style>${baseFrameStyle}\n${css}</style>`;
  const scriptTag = `<script>\n${getSandboxGuardScript()}\n</script>\n<script>\n${js}\n</script>`;

  if (/<html[\s>]/i.test(profileHtml)) {
    let document = profileHtml;
    if (/<head[\s>]/i.test(document)) {
      document = document.replace(/<head([^>]*)>/i, `<head$1>\n${cspMeta}\n${styleTag}`);
    } else {
      document = document.replace(/<html([^>]*)>/i, `<html$1>\n<head>${cspMeta}\n${styleTag}</head>`);
    }

    return /<\/body>/i.test(document)
      ? document.replace(/<\/body>/i, `${scriptTag}\n</body>`)
      : `${document}\n${scriptTag}`;
  }

  return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${cspMeta}
  ${styleTag}
</head>
<body>
${profileHtml}
${scriptTag}
</body>
</html>`;
}

function PreviewFrame({ enabled, html, css, js }: { enabled: boolean; html: string; css: string; js: string }) {
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.previewFallback}>
        <Text style={styles.previewFallbackText}>Web preview ready</Text>
      </View>
    );
  }

  if (!enabled) {
    return (
      <View style={styles.previewFallback}>
        <Text style={styles.previewFallbackText}>Preview paused</Text>
      </View>
    );
  }

  return React.createElement('iframe' as any, {
    title: 'Sori customizer preview',
    srcDoc: buildPreviewDocument(html, css, js),
    sandbox: 'allow-scripts',
    csp: FRAME_CSP,
    referrerPolicy: 'no-referrer',
    style: {
      width: '100%',
      height: '100%',
      border: '0',
      borderRadius: 24,
      backgroundColor: '#090914',
    },
  });
}

export default function CustomizeProfileScreen() {
  const { width } = useWindowDimensions();
  const [selectedTheme, setSelectedTheme] = useState(starterThemes[0].name);
  const [editorMode, setEditorMode] = useState<'custom' | 'theme' | 'ai'>('theme');
  const [htmlCode, setHtmlCode] = useState(starterThemes[0].html);
  const [cssCode, setCssCode] = useState(starterThemes[0].css);
  const [jsCode, setJsCode] = useState(starterThemes[0].js);
  const [aiPrompt, setAiPrompt] = useState('');
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [saved, setSaved] = useState(false);
  const [hasSavedCustomTheme, setHasSavedCustomTheme] = useState(false);
  const [versions, setVersions] = useState<SavedProfile[]>([]);
  const [limitMessage, setLimitMessage] = useState('');

  const compact = width < 760;
  const previewThemeName = editorMode === 'custom' ? CUSTOM_THEME_NAME : selectedTheme;

  useEffect(() => {
    const savedProfile = readSavedProfile();
    setVersions(readProfileVersions());

    if (!savedProfile.html && !savedProfile.css && !savedProfile.js) {
      return;
    }

    setSelectedTheme(CUSTOM_THEME_NAME);
    setEditorMode('custom');
    setHtmlCode(savedProfile.html || '');
    setCssCode(savedProfile.css || '');
    setJsCode(savedProfile.js || '');
    setSaved(true);
    setHasSavedCustomTheme(true);
  }, []);

  const chooseTheme = (theme: StarterTheme) => {
    setSelectedTheme(theme.name);
    setEditorMode('theme');
    setHtmlCode(theme.html);
    setCssCode(theme.css);
    setJsCode(theme.js);
    setSaved(false);
  };

  const chooseCustomTheme = () => {
    const savedProfile = readSavedProfile();
    setEditorMode('custom');
    setSelectedTheme(CUSTOM_THEME_NAME);

    if (savedProfile) {
      setHtmlCode(savedProfile.html || '');
      setCssCode(savedProfile.css || '');
      setJsCode(savedProfile.js || '');
      setSaved(true);
      setHasSavedCustomTheme(true);
    } else {
      setSaved(false);
    }
  };

  const markCustomEditing = () => {
    if (editorMode !== 'custom') {
      setEditorMode('custom');
      setSelectedTheme(CUSTOM_THEME_NAME);
    }
    setSaved(false);
  };

  const updateHtmlCode = (value: string) => {
    if (value.length > PROFILE_MAX_HTML_CHARS) {
      setLimitMessage(`HTML is limited to ${PROFILE_MAX_HTML_CHARS.toLocaleString()} characters for the localhost MVP.`);
    }
    setHtmlCode(value.slice(0, PROFILE_MAX_HTML_CHARS));
    markCustomEditing();
  };

  const updateCssCode = (value: string) => {
    if (value.length > PROFILE_MAX_CSS_CHARS) {
      setLimitMessage(`CSS is limited to ${PROFILE_MAX_CSS_CHARS.toLocaleString()} characters for the localhost MVP.`);
    }
    setCssCode(value.slice(0, PROFILE_MAX_CSS_CHARS));
    markCustomEditing();
  };

  const updateJsCode = (value: string) => {
    if (value.length > PROFILE_MAX_JS_CHARS) {
      setLimitMessage(`JavaScript is limited to ${PROFILE_MAX_JS_CHARS.toLocaleString()} characters for the localhost MVP.`);
    }
    setJsCode(value.slice(0, PROFILE_MAX_JS_CHARS));
    markCustomEditing();
  };

  const generateAiCode = () => {
    const vibe = escapeHtml(aiPrompt.trim() || 'glowing personal profile with a bold intro and photo blocks');
    setSelectedTheme('AI Draft');
    setEditorMode('ai');
    setHtmlCode(`<canvas id="sori-canvas"></canvas>
<main class="sori-ai">
  <section class="intro">
    <p class="tag">@your-sori</p>
    <h1>${vibe}</h1>
    <p class="bio">This is an AI-styled starting point. Edit the words, sections, and colors until it feels like you.</p>
  </section>
  <section class="memory-grid">
    <article>favorite photo</article>
    <article>current mood</article>
    <article>music loop</article>
    <article>personal link</article>
  </section>
</main>`);
    setCssCode(`.sori-ai {
  min-height: 100vh;
  padding: 38px;
  background:
    radial-gradient(circle at 18% 20%, rgba(103,232,249,.35), transparent 28%),
    radial-gradient(circle at 82% 14%, rgba(255,60,191,.42), transparent 30%),
    #080812;
}
.intro {
  max-width: 760px;
  border: 1px solid rgba(255,255,255,.16);
  background: rgba(255,255,255,.08);
  border-radius: 30px;
  padding: 30px;
}
.tag { color: #67e8f9; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
h1 { font-size: clamp(38px, 7vw, 80px); line-height: .92; margin: 0; text-transform: capitalize; }
.bio { color: #dbeafe; font-size: 17px; line-height: 1.55; }
.memory-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 24px; }
article {
  min-height: 130px;
  border-radius: 24px;
  display: grid;
  place-items: center;
  color: white;
  font-weight: 900;
  background: linear-gradient(135deg, rgba(255,60,191,.25), rgba(103,232,249,.18));
  border: 1px solid rgba(255,255,255,.16);
}`);
    setJsCode(`const canvas = document.getElementById('sori-canvas');
const ctx = canvas.getContext('2d');
let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
addEventListener('resize', resize);
addEventListener('mousemove', (event) => {
  mouse = { x: event.clientX, y: event.clientY };
});
resize();
function loop(time) {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = 0; i < 28; i += 1) {
    const angle = time * 0.001 + i;
    const x = mouse.x + Math.cos(angle) * (40 + i * 3);
    const y = mouse.y + Math.sin(angle * 1.4) * (28 + i * 2);
    ctx.beginPath();
    ctx.arc(x, y, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 ? 'rgba(255,60,191,.72)' : 'rgba(103,232,249,.72)';
    ctx.fill();
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);`);
    setSaved(false);
  };

  const saveProfile = () => {
    const payload = {
      themeName: selectedTheme,
      html: htmlCode,
      css: cssCode,
      js: jsCode,
      mode: 'advanced' as const,
    };

    persistProfile(payload);

    setSaved(true);
    setHasSavedCustomTheme(true);
    setVersions(readProfileVersions());
    setLimitMessage('');
  };

  const resetToDefaultProfile = () => {
    resetProfile();
    setSelectedTheme(starterThemes[0].name);
    setEditorMode('theme');
    setHtmlCode(starterThemes[0].html);
    setCssCode(starterThemes[0].css);
    setJsCode(starterThemes[0].js);
    setSaved(false);
    setHasSavedCustomTheme(false);
    setVersions(readProfileVersions());
  };

  const restoreVersion = (version: SavedProfile) => {
    setSelectedTheme(version.themeName || CUSTOM_THEME_NAME);
    setEditorMode('custom');
    setHtmlCode(version.html || '');
    setCssCode(version.css || '');
    setJsCode(version.js || '');
    setSaved(false);
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={StyleSheet.flatten([styles.content, compact && styles.contentCompact])}>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View>
          <Text style={styles.kicker}>PROFILE CUSTOMIZER</Text>
          <Text style={styles.title}>Build the profile people will visit.</Text>
          <Text style={styles.subtitle}>
            Choose a free theme, edit the HTML/CSS directly, or draft a starting point with the AI
            stylist. Save it, then jump back to your profile.
          </Text>
        </View>
        {saved ? (
          <Link href="/my-profile" asChild>
            <Pressable style={styles.goButton}>
              <Text style={styles.goButtonText}>Go to Profile</Text>
            </Pressable>
          </Link>
        ) : null}
      </View>

      <View style={[styles.workspace, compact && styles.workspaceCompact]}>
        <View style={[styles.leftPanel, compact && styles.leftPanelCompact]}>
          <Text style={styles.sectionTitle}>Custom theme</Text>
          <Pressable
            onPress={chooseCustomTheme}
            style={[styles.customThemeCard, editorMode === 'custom' && styles.customThemeCardActive]}>
            <Text style={styles.themeName}>Custom Theme</Text>
            <Text style={styles.themeDescription}>
              Edit your saved HTML, CSS, and JavaScript without starting over.
            </Text>
            <Text style={styles.customThemeStatus}>
              {hasSavedCustomTheme ? 'Saved code ready' : 'Start custom code'}
            </Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Free themes</Text>
          <View style={styles.themeList}>
            {starterThemes.map((theme) => {
              const active = editorMode === 'theme' && selectedTheme === theme.name;
              return (
                <Pressable
                  key={theme.name}
                  onPress={() => chooseTheme(theme)}
                  style={[styles.themeCard, active && styles.themeCardActive]}>
                  <Text style={styles.themeName}>{theme.name}</Text>
                  <Text style={styles.themeDescription}>{theme.description}</Text>
                  <Text style={styles.themeStatus}>{active ? 'Selected' : 'Use theme'}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.aiBox}>
            <Text style={styles.sectionTitle}>AI code helper</Text>
            <TextInput
              value={aiPrompt}
              onChangeText={setAiPrompt}
              multiline
              placeholder="Tell Sori what the page should feel like..."
              placeholderTextColor="#64748b"
              style={styles.aiInput}
            />
            <Pressable style={styles.aiButton} onPress={generateAiCode}>
              <Text style={styles.aiButtonText}>Generate Code</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.editorPanel, compact && styles.editorPanelCompact]}>
          <View style={styles.editorHeader}>
            <View>
              <Text style={styles.sectionTitle}>Advanced canvas</Text>
              <Text style={styles.editorNote}>HTML, CSS, and JS run only inside the isolated iframe.</Text>
            </View>
          <View style={styles.editorActions}>
              <Pressable style={styles.resetButton} onPress={resetToDefaultProfile}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </Pressable>
              <Pressable style={styles.pauseButton} onPress={() => setPreviewEnabled(!previewEnabled)}>
                <Text style={styles.pauseButtonText}>{previewEnabled ? 'Pause Preview' : 'Run Preview'}</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={saveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>

          {limitMessage ? (
            <Pressable style={styles.limitNotice} onPress={() => setLimitMessage('')}>
              <Text style={styles.limitNoticeText}>{limitMessage}</Text>
            </Pressable>
          ) : null}

          <Text style={styles.codeLabel}>HTML</Text>
          <TextInput
            value={htmlCode}
            onChangeText={updateHtmlCode}
            multiline
            style={styles.codeInput}
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.codeLabel}>CSS</Text>
          <TextInput
            value={cssCode}
            onChangeText={updateCssCode}
            multiline
            style={[styles.codeInput, styles.cssInput]}
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.codeLabel}>JavaScript</Text>
          <TextInput
            value={jsCode}
            onChangeText={updateJsCode}
            multiline
            style={[styles.codeInput, styles.jsInput]}
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {versions.length ? (
            <View style={styles.versionPanel}>
              <Text style={styles.sectionTitle}>Version history</Text>
              {versions.slice(0, 4).map((version, index) => (
                <Pressable key={`${version.themeName}-${index}`} style={styles.versionButton} onPress={() => restoreVersion(version)}>
                  <Text style={styles.versionTitle}>Restore {version.themeName || 'Custom Theme'}</Text>
                  <Text style={styles.versionMeta}>
                    HTML {version.html.length} / CSS {version.css.length} / JS {(version.js || '').length}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={[styles.previewPanel, compact && styles.previewPanelCompact]}>
          <View style={styles.previewHeader}>
            <Text style={styles.sectionTitle}>Live preview</Text>
            <Text style={styles.previewTheme}>{previewThemeName}</Text>
          </View>
          <View style={[styles.previewFrame, compact && styles.previewFrameCompact]}>
            <PreviewFrame enabled={previewEnabled} html={htmlCode} css={cssCode} js={jsCode} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#050509' },
  content: {
    minHeight: '100%',
    paddingLeft: 184,
    paddingRight: 22,
    paddingTop: 24,
    paddingBottom: 38,
    gap: 18,
  },
  contentCompact: {
    paddingLeft: 172,
    paddingRight: 10,
    paddingTop: 22,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 18,
  },
  headerCompact: {
    flexDirection: 'column',
    gap: 10,
  },
  kicker: {
    color: '#ff3cbf',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.7,
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    marginTop: 4,
  },
  subtitle: {
    color: '#a8b3c4',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 780,
    marginTop: 8,
  },
  goButton: {
    height: 46,
    borderRadius: 999,
    backgroundColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  goButtonText: {
    color: '#050509',
    fontSize: 14,
    fontWeight: '900',
  },
  workspace: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
  },
  workspaceCompact: {
    flexDirection: 'column',
    gap: 12,
  },
  leftPanel: {
    width: 260,
    gap: 14,
  },
  leftPanelCompact: {
    width: '100%',
  },
  editorPanel: {
    flex: 1,
    minWidth: 360,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0b1120',
    padding: 16,
  },
  editorPanelCompact: {
    minWidth: 0,
    padding: 12,
  },
  previewPanel: {
    width: 330,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,60,191,0.2)',
    backgroundColor: '#100817',
    padding: 16,
  },
  previewPanelCompact: {
    width: '100%',
    padding: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  themeList: {
    gap: 10,
  },
  customThemeCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.22)',
    backgroundColor: '#07111d',
    padding: 15,
  },
  customThemeCardActive: {
    borderColor: '#67e8f9',
    backgroundColor: 'rgba(103,232,249,0.14)',
  },
  themeCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.055)',
    padding: 14,
  },
  themeCardActive: {
    borderColor: '#ff3cbf',
    backgroundColor: 'rgba(255,60,191,0.14)',
  },
  themeName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  themeDescription: {
    color: '#a8b3c4',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  themeStatus: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 8,
  },
  customThemeStatus: {
    color: '#ff3cbf',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 8,
  },
  aiBox: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.2)',
    backgroundColor: '#07111d',
    padding: 14,
  },
  aiInput: {
    minHeight: 100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 19,
    padding: 12,
    marginTop: 12,
  },
  aiButton: {
    height: 42,
    borderRadius: 14,
    backgroundColor: '#ff3cbf',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  aiButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  editorActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editorNote: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  saveButton: {
    minWidth: 94,
    height: 42,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  resetButton: {
    minWidth: 78,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.28)',
    backgroundColor: 'rgba(248,113,113,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  resetButtonText: {
    color: '#fecaca',
    fontSize: 13,
    fontWeight: '900',
  },
  pauseButton: {
    minWidth: 112,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  pauseButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  saveButtonText: {
    color: '#050509',
    fontSize: 14,
    fontWeight: '900',
  },
  limitNotice: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.3)',
    backgroundColor: 'rgba(250,204,21,0.1)',
    padding: 10,
    marginBottom: 6,
  },
  limitNoticeText: {
    color: '#fde68a',
    fontSize: 12,
    fontWeight: '900',
  },
  codeLabel: {
    color: '#f0abfc',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 10,
    marginBottom: 8,
  },
  codeInput: {
    minHeight: 190,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#050509',
    color: '#dbeafe',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
    padding: 14,
  },
  cssInput: {
    minHeight: 230,
  },
  jsInput: {
    minHeight: 190,
  },
  versionPanel: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.045)',
    padding: 12,
    marginTop: 14,
    gap: 8,
  },
  versionButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.055)',
    padding: 10,
  },
  versionTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  versionMeta: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  previewTheme: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '900',
  },
  previewFrame: {
    flex: 1,
    minHeight: 620,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#090914',
  },
  previewFrameCompact: {
    minHeight: 360,
  },
  previewFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewFallbackText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
});
