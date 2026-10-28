'use client';

// Dev-only tool: renders the hero scene frame by frame (deterministic, seamless
// loop) and encodes an H.264 MP4 in the browser with WebCodecs. No ffmpeg needed.
// Open /dev-record in Chrome/Edge, wait for "ready", press Record, then download.

import { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import type { Recorder } from '@/components/3d/SolarScene';

const SolarScene = dynamic(() => import('@/components/3d/SolarScene'), { ssr: false });

const W = 1280;
const H = 720;
const FPS = 30;
const LOOP = 60; // seconds
const BITRATE = 650_000; // ~5 MB for 60s

export default function DevRecordPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  const time = useRef(0);
  const api = useRef<{ advance: (t: number) => void; canvas: HTMLCanvasElement } | null>(null);
  const [status, setStatus] = useState('loading models…');
  const [url, setUrl] = useState('');

  const recorder = useMemo<Recorder>(
    () => ({
      loop: LOOP,
      time,
      onReady: (a) => {
        api.current = a;
        setStatus('ready');
      },
    }),
    []
  );

  const record = async () => {
    const a = api.current;
    if (!a) return;
    try {
      const candidates = ['avc1.640028', 'avc1.4d0028', 'avc1.42001f'];
      let codec = '';
      for (const c of candidates) {
        const s = await VideoEncoder.isConfigSupported({ codec: c, width: W, height: H, bitrate: BITRATE, framerate: FPS });
        if (s.supported) {
          codec = c;
          break;
        }
      }
      if (!codec) throw new Error('This browser cannot encode H.264 (use Chrome or Edge).');

      const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: 'avc', width: W, height: H }, fastStart: 'in-memory' });
      const enc = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => setStatus(`encoder error: ${e.message}`),
      });
      enc.configure({ codec, width: W, height: H, bitrate: BITRATE, framerate: FPS, latencyMode: 'quality' });

      const N = FPS * LOOP;
      const yieldNow = () => new Promise<void>((r) => { const ch = new MessageChannel(); ch.port1.onmessage = () => r(); ch.port2.postMessage(0); });
      for (let i = 0; i < N; i++) {
        time.current = i / FPS;
        a.advance((i * 1000) / FPS);
        const frame = new VideoFrame(a.canvas, { timestamp: Math.round((i * 1e6) / FPS) });
        enc.encode(frame, { keyFrame: i % 60 === 0 });
        frame.close();
        if (i % 4 === 0) {
          setStatus(`recording ${i + 1}/${N}`);
          while (enc.encodeQueueSize > 6) await yieldNow();
          await yieldNow();
        }
      }
      await enc.flush();
      muxer.finalize();
      const blob = new Blob([muxer.target.buffer], { type: 'video/mp4' });
      setUrl(URL.createObjectURL(blob));
      setStatus(`done · ${(blob.size / 1e6).toFixed(2)} MB`);

      // dev server helper: write straight into public/media (404s harmlessly if absent)
      fetch('/api/dev-save', { method: 'POST', body: blob }).then((r) => r.ok && setStatus(`done · saved ${(blob.size / 1e6).toFixed(2)} MB`)).catch(() => {});
    } catch (e) {
      setStatus(`failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed left-2 top-2 z-50 flex items-center gap-3 rounded bg-black/80 px-3 py-2 text-xs">
        <span id="rec-status">{status}</span>
        <button onClick={record} disabled={status !== 'ready'} className="rounded bg-yellow-400 px-3 py-1 font-semibold text-black disabled:opacity-40">
          Record {LOOP}s loop
        </button>
        {url && (
          <a href={url} download="hero-loop.mp4" className="underline">
            download
          </a>
        )}
      </div>
      <div style={{ position: 'relative', width: W, height: H }}>
        <SolarScene active motion recorder={recorder} />
      </div>
    </div>
  );
}
