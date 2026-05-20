import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  FRAME_CSP,
  getSandboxGuardScript,
  sanitizeProfileHtml,
  securityTestCases,
  validateExternalUrl,
} from '@/lib/profile-security';

const testHtml = sanitizeProfileHtml(`
<main class="wrap">
  <canvas id="canvas"></canvas>
  <h1>Sandbox test</h1>
  <a href="https://example.com/sori-test">External link</a>
  <a href="javascript:alert(1)">Bad JS link</a>
  <a href="http://127.0.0.1:54321/private">Private IP link</a>
  <form action="https://evil.example"><input name="password" /></form>
  <iframe src="https://example.com"></iframe>
  <img src="https://example.com/nazi-test-image.jpg" />
</main>
`);

const testCss = `
body { margin: 0; background: #090914; color: white; font-family: system-ui; }
.wrap { min-height: 100vh; padding: 28px; }
canvas { position: fixed; inset: 0; width: 100vw; height: 100vh; }
h1, a { position: relative; z-index: 2; display: block; margin: 12px 0; }
a { color: #67e8f9; font-weight: 900; }
`;

const testJs = `
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
resize();
addEventListener('resize', resize);
let frame = 0;
function loop() {
  frame += 1;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.fillStyle = 'rgba(255,60,191,.55)';
  ctx.beginPath();
  ctx.arc(80 + Math.sin(frame / 20) * 30, 90, 18, 0, Math.PI * 2);
  ctx.fill();
  requestAnimationFrame(loop);
}
loop();
try { parent.document.body.dataset.hacked = 'true'; } catch (error) { console.log('parent blocked'); }
try { window.open('https://example.com'); } catch (error) { console.log('popup blocked'); }
try { top.location.href = 'https://example.com/redirect'; } catch (error) { console.log('top redirect blocked'); }
`;

function buildTestDoc() {
  return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="${FRAME_CSP}" />
  <style>${testCss}</style>
</head>
<body>
${testHtml}
<script>${getSandboxGuardScript()}</script>
<script>${testJs}</script>
</body>
</html>`;
}

function TestFrame() {
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.frameFallback}>
        <Text style={styles.frameFallbackText}>Security iframe tests run on web.</Text>
      </View>
    );
  }

  return React.createElement('iframe' as any, {
    title: 'Sori sandbox security test',
    srcDoc: buildTestDoc(),
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

export default function SecurityTestScreen() {
  const blockedExamples = [
    'javascript:alert(1)',
    'data:text/html,hello',
    'http://localhost:8081',
    'http://127.0.0.1:5432',
    'http://192.168.1.2/router',
  ];

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>SECURITY TESTS</Text>
        <Text style={styles.title}>Custom profile sandbox checks</Text>
        <Text style={styles.subtitle}>
          Localhost test page for the current MVP guardrails. It keeps creative JavaScript alive
          while checking that dangerous browser behaviors are contained.
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Expected checks</Text>
          {securityTestCases.map((test) => (
            <Text key={test} style={styles.checkItem}>Pass target: {test}</Text>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Blocked URL examples</Text>
          {blockedExamples.map((url) => {
            const result = validateExternalUrl(url);
            return (
              <Text key={url} style={styles.checkItem}>
                {result.allowed ? 'Allowed' : 'Blocked'}: {url}
              </Text>
            );
          })}
        </View>
      </View>

      <View style={styles.frameShell}>
        <TestFrame />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#050509' },
  content: {
    minHeight: '100%',
    paddingLeft: 184,
    paddingRight: 28,
    paddingTop: 34,
    paddingBottom: 44,
    gap: 18,
  },
  header: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0f172a',
    padding: 24,
  },
  kicker: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.7,
  },
  title: {
    color: '#ffffff',
    fontSize: 38,
    lineHeight: 43,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  panel: {
    flex: 1,
    minWidth: 300,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0b1120',
    padding: 18,
  },
  panelTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 10,
  },
  checkItem: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '800',
  },
  frameShell: {
    height: 420,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,60,191,0.22)',
    backgroundColor: '#090914',
    overflow: 'hidden',
  },
  frameFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameFallbackText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});
