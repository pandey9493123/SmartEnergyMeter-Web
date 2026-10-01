let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    if (ctx) return ctx;
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    return ctx;
  } catch {
    return null;
  }
}

function beep(audio: AudioContext, freq: number, delaySec: number, durSec = 0.15, type: OscillatorType = 'square') {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0.06;
  osc.connect(gain);
  gain.connect(audio.destination);
  const start = audio.currentTime + delaySec;
  osc.start(start);
  osc.stop(start + durSec);
}

export function playAlertSound(severity: 'critical' | 'warning' | 'info') {
  const audio = getContext();
  if (!audio) return;
  try {
    if (audio.state === 'suspended') void audio.resume();
    if (severity === 'critical') {
      beep(audio, 880, 0);
      beep(audio, 880, 0.2);
      beep(audio, 880, 0.4);
    } else if (severity === 'warning') {
      beep(audio, 660, 0, 0.2, 'sine');
      beep(audio, 520, 0.25, 0.2, 'sine');
    } else {
      beep(audio, 520, 0, 0.12, 'sine');
    }
  } catch {
    /* audio unavailable — stay silent */
  }
}
