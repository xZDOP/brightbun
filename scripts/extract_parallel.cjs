const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const ai = new GoogleGenAI();
const fileUri = 'https://generativelanguage.googleapis.com/v1beta/files/kd91js2bvjde';

async function extractBatch(startQ, endQ) {
  console.log(`[Batch ${startQ}-${endQ}] Starting request...`);
  const prompt = `Analyze the attached Dutch Listening exam video ("Mondeling / Luister, Vraag nummer X / 60").
Extract all questions from ${startQ} to ${endQ} (inclusive).
For EACH question:
- "id": integer ${startQ} to ${endQ}
- "dutchQuestion": Dutch question prompt (e.g. "Wat hoort u in het fragment?" or specific question text)
- "englishQuestionTranslation": English translation of the question prompt
- "audioTranscript": Exact spoken Dutch transcript of what the speaker says in this question's audio fragment
- "englishAudioTranslation": English translation of what was spoken
- "options": Array of 3 or 4 options in Dutch as displayed on screen
- "correctIndex": 0-based integer of the correct answer matching the audio
- "explanation": In-depth English explanation of the spoken context, key Dutch words, and why the correct answer is right.

Return strictly a JSON array of ${endQ - startQ + 1} objects for questions ${startQ} to ${endQ}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
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

  const filename = `scripts/batch_${startQ}_${endQ}.json`;
  fs.writeFileSync(filename, response.text);
  console.log(`[Batch ${startQ}-${endQ}] Saved to ${filename} (${response.text.length} chars)`);
}

async function main() {
  console.log('Extracting all 4 batches in parallel...');
  await Promise.all([
    extractBatch(1, 15),
    extractBatch(16, 30),
    extractBatch(31, 45),
    extractBatch(46, 60)
  ]);
  console.log('All 4 batches finished!');
}

main().catch(console.error);
