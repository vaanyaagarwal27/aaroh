const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const cors = require('cors');
app.use(cors());
const upload = multer({ dest: 'uploads/' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());

async function generateWithFallback(prompt, fileData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent([prompt, fileData]);
    return { result, usedFallback: false };
  } catch (primaryError) {
    console.log('gemini-2.5-flash failed, trying gemini-1.5-flash...', primaryError.message);
    try {
      const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await fallbackModel.generateContent([prompt, fileData]);
      return { result, usedFallback: false };
    } catch (fallbackError) {
      console.log('gemini-1.5-flash also failed:', fallbackError.message);
      throw new Error('BOTH_MODELS_UNAVAILABLE');
    }
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'Aaroh backend is running!' });
});

app.post('/api/extract', upload.single('pdf'), async (req, res) => {
  const pdfPath = req.file?.path;
  if (!pdfPath) return res.status(400).json({ error: "No PDF uploaded" });

  try {
    const pdfData = fs.readFileSync(pdfPath);
    const base64PDF = pdfData.toString('base64');

    const prompt = `You are an expert Indian Legal Clerk with deep knowledge of Indian court 
judgment structures, especially Karnataka High Court.

Return ONLY valid JSON. No markdown, no backticks, no explanation, 
no text before or after the JSON. If you add anything outside the JSON 
the output will break.

### STEP 1 — FIND THESE SECTIONS IN ORDER:

HEADER SECTION (first 2-3 pages):
- ⁠  ⁠Case number: formats like WP/123/2024, FAO 86/2021, CRL.P/456/2023
- ⁠  ⁠Court name: exact name as written
- ⁠  ⁠Order date: look for "DATED THIS THE" or date at very end of judgment
- ⁠  ⁠Parties: look for "BETWEEN:" then petitioner, then "AND:" or "Vs." 
  for respondent

OPERATIVE ORDER SECTION (last 1-3 pages):
This is where ALL actionable directions live. Search for text after:
- ⁠  ⁠"In view of the above,"
- ⁠  ⁠"Accordingly,"
- ⁠  ⁠"Hence the following directions are issued:"
- ⁠  ⁠"The writ petition is disposed of with the following directions:"
- ⁠  ⁠"Resultantly,"
- ⁠  ⁠"In the result,"
- ⁠  ⁠"For the aforesaid reasons,"
Extract EVERY sentence in this section without skipping any.

### STEP 2 — CLASSIFY EACH DIRECTION:

BINDING_TO_GOVT — when direction:
- ⁠  ⁠Orders any government entity (State, Department, Officer, Authority, 
  Corporation, Board, Commission, Tribunal)
- ⁠  ⁠Uses mandatory language: shall, must, directed to, ordered to, 
  is required to, hereby orders, is commanded to
- ⁠  ⁠Examples:
  "The State shall reconsider the application within 30 days"
  "The respondent authorities are directed to issue the NOC"
  "The Tahsildar is ordered to conduct an inquiry"
  Any direction to R1, R2, R3 when they are government entities

TO_PETITIONER — when direction:
- ⁠  ⁠Orders the petitioner or any private party to act
- ⁠  ⁠Examples:
  "The petitioner shall submit revised application"
  "The writ petitioner may approach the competent authority"

OBSERVATION — when text is:
- ⁠  ⁠Judicial commentary with no actionable mandate
- ⁠  ⁠Expressions of hope, expectation, or disappointment
- ⁠  ⁠General legal principles being stated
- ⁠  ⁠Examples:
  "It is expected that such delays will not recur"
  "We observe that the procedure was not followed"
  "This Court is of the view that..."
  "It is unfortunate that..."
  "It appears that..."

### STEP 3 — EXTRACT TIMELINES:

Explicit deadlines: "within 30 days", "within two weeks", 
"within 3 months from today"
→ Convert to actual calendar date by adding to order date
→ Example: order date 29-04-2026 + 2 months = 29-06-2026

Vague deadlines: "forthwith", "immediately", 
"as expeditiously as possible", "at the earliest", "without delay"
→ Set calculated_deadline to order date + 30 days
→ Mark original_timeline as the vague phrase

No deadline: "may consider", "is at liberty to", no time mentioned
→ Set calculated_deadline to null
→ Set calculated_deadline_days to null

Always calculate deadline from order date unless judgment specifically 
says "from date of application" or "from receipt of notice"

### STEP 4 — CALCULATE URGENCY:

Do this calculation yourself every single time:
Step A: Find order_date and calculated_deadline from your extraction
Step B: Count the number of days between order_date and 
        calculated_deadline
Step C: Apply these rules with no exceptions:

HIGH urgency if ANY of these are true:
- ⁠  ⁠Days between order and deadline is less than 30
- ⁠  ⁠Case involves life, safety, liberty, or contempt of court
- ⁠  ⁠Vague deadline was used (forthwith, immediately) 
  since these imply extreme urgency
- ⁠  ⁠Court explicitly used words "urgent" or "immediately"

MEDIUM urgency if ALL of these are true:
- ⁠  ⁠Days between order and deadline is between 31 and 90
- ⁠  ⁠Case involves compensation, service matters, property, 
  land, or administrative action
- ⁠  ⁠No life or safety risk involved

LOW urgency if ANY of these are true:
- ⁠  ⁠Days between order and deadline is more than 90
- ⁠  ⁠No deadline was mentioned at all
- ⁠  ⁠Deadline is REASONABLE_TIME with no specific date

Show your working like this in urgency_calculation field:
"Order date 29-04-2026 + 2 months = deadline 29-06-2026 = 
61 days from order = MEDIUM. Case involves compensation, 
no life/safety risk."

### STEP 5 — IDENTIFY RESPONSIBLE ENTITY:

Look for specific designations:
Tahsildar, Deputy Commissioner, Chief Secretary, 
Commissioner of Police, Principal Secretary

Look for department names:
Revenue Department, Transport Department, 
Urban Development Authority, Railways, Ministry of X

Extract respondent numbers if applicable:
R1, R2 (Deputy Commissioner Bangalore Urban)

If direction says "respondents" generally:
Write "Respondent Authorities (State of Karnataka)"

### STEP 6 — APPEAL LIMITATION:

High Court order → Supreme Court SLP: 90 days from order date
District Court → High Court: 30 days from order date
If interim order: write "Subject to appeal or modification"
Calculate the actual appeal deadline date from order date

### STEP 7 — GENERATE ACTION PLAN:

Write 3 to 5 specific steps the responsible department must actually do.
Steps must be concrete, not generic.

BAD: "Step 1: Comply with the court order"
GOOD: "Step 1: Railway Claims Tribunal to list the matter on 
       12-05-2026 and begin compensation assessment proceedings"

### OUTPUT — RETURN EXACTLY THIS JSON STRUCTURE:

{
  "case_metadata": {
    "case_number": "exact case number",
    "order_date": "DD-MM-YYYY",
    "court_name": "exact court name",
    "order_type": "INTERIM or FINAL_DISPOSAL",
    "subject_matter": "one sentence describing what the case is about",
    "parties": {
      "petitioner": "full name",
      "respondent": "full name"
    }
  },

  "directions": [
    {
      "verbatim_text": "exact words from judgment, do not paraphrase",
      "category": "BINDING_TO_GOVT or TO_PETITIONER or OBSERVATION",
      "responsible_entity": "specific officer or department name or null",
      "original_timeline": "exact phrase from judgment or null",
      "calculated_deadline": "DD-MM-YYYY or null",
      "calculated_deadline_days": "number of days from order date or null",
      "confidence_score": "HIGH or MEDIUM or LOW"
    }
  ],

  "overall_assessment": {
    "primary_responsible_department": "main department that must act",
    "action_required": "COMPLY or APPEAL or NO_ACTION",
    "compliance_deadline": "DD-MM-YYYY or REASONABLE_TIME or null",
    "appeal_deadline": "DD-MM-YYYY or NOT_APPLICABLE",
    "urgency": "HIGH or MEDIUM or LOW",
    "urgency_calculation": "show your working here as described above",
    "action_plan": [
      "Step 1: specific action",
      "Step 2: specific action",
      "Step 3: specific action"
    ]
  },

  "confidence_overall": "HIGH or MEDIUM or LOW",
  "confidence_reason": "one sentence explaining confidence level"
}

### CONFIDENCE SCORING RULES:

HIGH: Direction uses shall or must, timeline is explicit, 
      responsible entity is named specifically

MEDIUM: Direction is clear but timeline is vague OR 
        responsible entity not specifically named

LOW: Direction is ambiguous, uses permissive language like may, 
     or is buried in complex legal text

### FINAL RULES:

- ⁠  ⁠Extract ALL directions from operative order section, skip nothing
- ⁠  ⁠Never paraphrase verbatim_text, copy exact words
- ⁠  ⁠Never leave any field blank, write UNKNOWN if genuinely unsure
- ⁠  ⁠Never write null for urgency, always calculate it
- ⁠  ⁠If order_type is INTERIM, set appeal_limitation to 
  "Subject to appeal or modification"
- ⁠  ⁠Return only the JSON, absolutely nothing else`;

    const fileData = {
      inlineData: {
        mimeType: 'application/pdf',
        data: base64PDF,
      },
    };

    const { result } = await generateWithFallback(prompt, fileData);

    const responseText = result.response.text();
    console.log('Raw Gemini response:', responseText);

    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }

    const extractedData = JSON.parse(cleanedResponse);

    const summary = {
      total_directions: extractedData.directions.length,
      binding_to_govt: extractedData.directions.filter(d => d.category === 'BINDING_TO_GOVT').length,
      to_petitioner: extractedData.directions.filter(d => d.category === 'TO_PETITIONER').length,
      observations: extractedData.directions.filter(d => d.category === 'OBSERVATION').length,
    };

    fs.unlinkSync(pdfPath);

    res.json({
      success: true,
      data: extractedData,
      summary: summary
    });

  } catch (error) {
    if (pdfPath && fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    console.error('Extraction Error:', error);
    if (error.message === 'BOTH_MODELS_UNAVAILABLE') {
      return res.status(503).json({
        success: false,
        bothModelsFailed: true,
        error: 'BOTH_MODELS_UNAVAILABLE',
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to parse legal document."
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Aaroh Server running on http://localhost:${PORT}`);
  console.log('Ready to process court judgments.');
});