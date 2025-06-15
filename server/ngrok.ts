import ngrok from 'ngrok';
import { config } from './config';

export async function startNgrok() {
  try {
    const url = await ngrok.connect({
      addr: config.server.port,
      region: 'eu',
    });
    
    console.log(`
    ┌────────────────────────────────────────────────┐
    │                                                │
    │   🚀 Application available online at:          │
    │   ${url}                │
    │                                                │
    │   Local URL: http://localhost:${config.server.port}        │
    │                                                │
    └────────────────────────────────────────────────┘
    `);
    
    return url;
  } catch (error) {
    console.error('Failed to start ngrok:', error);
    return null;
  }
}