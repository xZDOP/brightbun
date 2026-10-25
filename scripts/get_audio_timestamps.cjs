const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const ai = new GoogleGenAI();
const fileUri = 'https://generativelanguage.googleapis.com/v1beta/files/kd91js2bvjde';

async function getTimestamps(startQ, endQ) {
  console.log(`Getting timestamps for Q${startQ} - Q${endQ}...`);
  const prompt = `You are an audio engineer and transcriptionist analyzing the attached Dutch BRIGHT language exam video.
Identify the EXACT start and end timestamps (in seconds with 1 decimal place, e.g. start: 2.7, end: 11.4) when the audio fragment for each question (from Question ${startQ} to Question ${endQ}) is spoken for the first time in the video.
For each question:
- "id": integer (${startQ} to ${endQ})
- "start": float (start time in seconds when the voice begins speaking)
- "end": float (end time in seconds when the voice finishes speaking)

Return ONLY a JSON array of objects:
[
  { "id": ${startQ}, "start": ..., "end": ... },
  ...
]`;

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { fileData: { fileUri, mimeType: 'video/mp4' } },
              { text: prompt }
            ]
          }
        ],
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      });

      const data = JSON.parse(response.text);
      console.log(`Success for Q${startQ}-Q${endQ}: got ${data.length} items`);
      return data;
    } catch (e) {
      console.error(`Attempt ${attempt} failed:`, e.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  throw new Error(`Failed to get timestamps for Q${startQ}-Q${endQ}`);
}

async function main() {
  const b1 = await getTimestamps(1, 15);
  const b2 = await getTimestamps(16, 30);
  const b3 = await getTimestamps(31, 45);
  const b4 = await getTimestamps(46, 60);

  const all = [...b1, ...b2, ...b3, ...b4];
  fs.writeFileSync('scripts/audio_timestamps.json', JSON.stringify(all, null, 2));
  console.log(`Saved ${all.length} timestamps to scripts/audio_timestamps.json`);
}

main().catch(console.error);
