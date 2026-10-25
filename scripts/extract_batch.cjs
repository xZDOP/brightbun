const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const ai = new GoogleGenAI();
const fileUri = 'https://generativelanguage.googleapis.com/v1beta/files/kd91js2bvjde';

async function extractBatch(startQ, endQ) {
  console.log(`Extracting questions ${startQ} to ${endQ}...`);
  const prompt = `You are an expert Dutch language instructor and test transcriptionist.
Analyze the attached Dutch BRIGHT language exam video ("Mondeling, Vraag nummer X / 60").

Please extract questions ${startQ} through ${endQ} (inclusive).
For each question:
1. "id": The question number (integer ${startQ} to ${endQ})
2. "dutchQuestion": The question text or prompt shown on screen (if no prompt on screen, provide the natural question prompt asking about the audio fragment, e.g. "Wat wordt er bedoeld met het audiofragment?" or the exact text displayed).
3. "englishQuestionTranslation": Natural English translation of the question.
4. "audioTranscript": Exact Dutch transcript of what the spoken audio says for this question.
5. "englishAudioTranslation": Clear, natural English translation of what was spoken.
6. "options": Array of 3 or 4 options in Dutch exactly as shown on the screen.
7. "correctIndex": The zero-based index (0, 1, 2, or 3) of the correct answer based on what the audio stated. (If the test taker selected an option, verify whether it is indeed the correct answer matching the audio).
8. "explanation": Comprehensive pedagogical English explanation explaining why the correct option is right based on the audio, vocabulary, or grammar nuance, and why the other options are incorrect.

Return ONLY a valid JSON array of objects for questions ${startQ} to ${endQ}. Do not wrap in markdown or backticks if possible, or return strictly valid JSON.`;

  let attempts = 0;
  while (attempts < 5) {
    try {
      attempts++;
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                fileData: {
                  fileUri: fileUri,
                  mimeType: 'video/mp4'
                }
              },
              { text: prompt }
            ]
          }
        ],
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      fs.writeFileSync(`scripts/batch_${startQ}_${endQ}.json`, text);
      console.log(`Saved batch_${startQ}_${endQ}.json (length: ${text.length})`);
      break;
    } catch (err) {
      console.warn(`Attempt ${attempts} failed:`, err.message || err);
      if (attempts >= 5) throw err;
      const waitMs = attempts * 5000;
      console.log(`Waiting ${waitMs}ms before retry...`);
      await new Promise(r => setTimeout(r, waitMs));
    }
  }
}

async function run() {
  await extractBatch(1, 15);
  await extractBatch(16, 30);
  await extractBatch(31, 45);
  await extractBatch(46, 60);
  console.log('All 4 batches extracted successfully!');
}

run().catch(console.error);
