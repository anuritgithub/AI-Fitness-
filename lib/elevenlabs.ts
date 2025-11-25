export async function generateSpeech(text: string, apiKey: string): Promise<ArrayBuffer> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('ElevenLabs API key is missing');
  }

  const VOICE_ID = "WrjxnKxK0m1uiaH0uteU"; // Your George voice ID
  const MODEL_ID = "eleven_multilingual_v2"; // Free tier supported model

  try {
    console.log('Attempting ElevenLabs API call...');
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text.substring(0, 5000), // Limit to 5000 chars
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API Error:', errorText);
      
      // Check if it's a quota error
      if (errorText.includes('quota_exceeded')) {
        console.warn('ElevenLabs quota exceeded. Please upgrade your plan or wait for quota reset.');
        throw new Error('Quota exceeded - Please upgrade your ElevenLabs plan');
      }
      
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    console.log('Speech generated successfully via ElevenLabs');
    return await response.arrayBuffer();
  } catch (error: any) {
    console.error('ElevenLabs error:', error.message);
    console.log('Falling back to browser-based TTS (Web Speech API)...');
    throw error;
  }
}

// Helper function to create a silent audio buffer (fallback)
export function createSilentAudio(): ArrayBuffer {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
  return buffer.getChannelData(0).buffer;
}



