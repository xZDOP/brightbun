import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getAudioClipPath, calculateBrightScore } from './quiz.ts';

test('getAudioClipPath generates valid audio paths for listening questions 1 to 60', () => {
  assert.equal(getAudioClipPath(1), '/audio/q_1.mp3');
  assert.equal(getAudioClipPath(30), '/audio/q_30.mp3');
  assert.equal(getAudioClipPath(60), '/audio/q_60.mp3');

  assert.throws(() => getAudioClipPath(0));
  assert.throws(() => getAudioClipPath(61));
});

test('verify all 60 audio clips exist on disk in public/audio directory', () => {
  for (let i = 1; i <= 60; i++) {
    const filePath = path.join(process.cwd(), 'public', 'audio', `q_${i}.mp3`);
    assert.equal(fs.existsSync(filePath), true, `File public/audio/q_${i}.mp3 should exist`);
    const stats = fs.statSync(filePath);
    assert.ok(stats.size > 20000, `File q_${i}.mp3 must be non-empty audio (>20KB), got ${stats.size}`);
  }
});

test('calculateBrightScore computes accurate percentages, Bright 0-5 scale and CEFR levels', () => {
  const perfect = calculateBrightScore(60, 60);
  assert.equal(perfect.percentage, 100);
  assert.equal(perfect.scoreScale, 5.0);
  assert.equal(perfect.cefrLevel, 'C1+ / Fluent');

  const advanced = calculateBrightScore(52, 60);
  assert.equal(advanced.percentage, 87);
  assert.equal(advanced.scoreScale, 4.4);
  assert.equal(advanced.cefrLevel, 'C1 / Advanced');

  const intermediate = calculateBrightScore(36, 60);
  assert.equal(intermediate.percentage, 60);
  assert.equal(intermediate.scoreScale, 3.0);
  assert.equal(intermediate.cefrLevel, 'B2 / Independent User');
});
