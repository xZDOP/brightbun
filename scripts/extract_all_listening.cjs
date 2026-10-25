const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const ai = new GoogleGenAI();
const fileUri = 'https://generativelanguage.googleapis.com/v1beta/files/kd91js2bvjde';

async function extractBatch(startQ, endQ) {
  console.log(`Extracting questions ${startQ} to ${endQ}...`);
  const prompt = `You are an expert Dutch language assessor.
Analyze the attached 34-minute video of the BRIGHT Dutch Listening Comprehension exam ("Mondeling / Luister, Vraag nummer X / 60").

Please extract questions ${startQ} through ${endQ} (inclusive).
For EACH question in this range:
1. "id": number (${startQ} to ${endQ})
2. "dutchQuestion": Dutch question prompt for this question (e.g., specific question text on screen, or "Wat hoort u in het fragment?" / "Wat wordt er bedoeld?")
3. "englishQuestionTranslation": Natural English translation of the question prompt
4. "audioTranscript": Exact Dutch spoken transcript of the audio fragment played for this question in the video
5. "englishAudioTranslation": Accurate English translation of the audio transcript
6. "options": Array of 3 or 4 options in Dutch exactly as shown on the test screen
7. "correctIndex": Zero-based index (0, 1, 2, or 3) of the correct answer according to the audio fragment
8. "explanation": Comprehensive English explanation explaining what was said in the audio, the key Dutch vocabulary/grammar concepts, why the correct answer matches, and why the other options are incorrect.

Return STRICTLY a JSON array of ${endQ - startQ + 1} objects for questions ${startQ} to ${endQ}.`;

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
  console.log(`Successfully saved ${filename} (size: ${response.text.length} chars)`);
}

async function run() {
  await extractBatch(1, 15);
  await extractBatch(16, 30);
  await extractBatch(31, 45);
  await extractBatch(46, 60);
  console.log('ALL 60 QUESTIONS EXTRACTED!');
}

run().catch(console.error);
