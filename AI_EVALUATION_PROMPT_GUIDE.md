# AI Evaluation Prompt Engineering Guide

This document contains the prompt templates and strategies used in this project for AI-powered evaluation. These prompts can be adapted for different evaluation scenarios.

---

## Core Prompt Structure

### 1. Role Definition
Start by clearly defining the AI's role and expertise:

```
You are an expert [DOMAIN] evaluator using [STANDARD/FRAMEWORK] standards.
```

**Example from this project:**
```
You are an expert English language evaluator using CEFR (Common European Framework of Reference for Languages) standards.
```

---

## 2. Evaluation Criteria

Clearly list what attributes/dimensions to evaluate:

```
Evaluate the [INPUT_TYPE] based on these [N] attributes:
1. [Attribute 1] - [brief description of what to assess]
2. [Attribute 2] - [brief description of what to assess]
3. [Attribute 3] - [brief description of what to assess]
4. [Attribute 4] - [brief description of what to assess]
```

**Example - Text Evaluation:**
```
Evaluate the following text based on these 4 attributes:
1. Complexity - vocabulary range, sentence structure variety, sophistication
2. Accuracy - grammar, spelling, proper word usage
3. Fluency - cohesion, coherence, natural flow
4. Clarity - how clearly ideas are expressed
```

**Example - Audio/Speaking Evaluation:**
```
Evaluate the speaker's English based on these 4 attributes:
1. Complexity - vocabulary range, sentence structure variety, sophistication of language used
2. Accuracy - grammar correctness, proper word usage, minimal errors
3. Fluency - smoothness of speech, natural pace, coherence, minimal hesitation
4. Pronunciation - clarity of speech sounds, stress patterns, intonation, accent comprehensibility
```

---

## 3. Output Format Specification

Define exactly what the AI should return for each attribute:

```
For each attribute, provide:
- A [SCALE/LEVEL] ([options])
- [Type of feedback] ([length guideline])
```

**Example from this project:**
```
For each attribute, provide:
- A CEFR level (A1, A2, B1, B2, C1, or C2)
- Brief descriptive feedback (2-3 sentences)

Also provide an overall CEFR level (the lowest of the 4 attributes) with a brief explanation.
```

---

## 4. Input Presentation

Clearly present the content to be evaluated:

**For Text:**
```
Text to evaluate:
"[TEXT_CONTENT]"
```

**For Audio:**
```
Listen to the audio recording and evaluate the speaker's [LANGUAGE/SKILL].
```
(Audio is provided as base64-encoded data in the API call)

---

## 5. JSON Response Format Enforcement

**Critical for parsing:** Force structured output with explicit JSON schema:

```
Respond ONLY with valid JSON in this exact format:
{
  "overall": {
    "level": "[EXAMPLE_VALUE]",
    "explanation": "[EXAMPLE_TEXT]"
  },
  "attributes": {
    "[attribute_1]": {
      "level": "[EXAMPLE_VALUE]",
      "feedback": "[EXAMPLE_TEXT]"
    },
    "[attribute_2]": {
      "level": "[EXAMPLE_VALUE]",
      "feedback": "[EXAMPLE_TEXT]"
    }
  }
}
```

---

## Complete Prompt Templates

### Template 1: Text Evaluation Prompt

```
You are an expert [DOMAIN] evaluator using [STANDARD] standards.

Evaluate the following text based on these [N] attributes:
1. [Attribute 1] - [description]
2. [Attribute 2] - [description]
3. [Attribute 3] - [description]
4. [Attribute 4] - [description]

For each attribute, provide:
- A [LEVEL/SCORE] ([range or options])
- Brief descriptive feedback (2-3 sentences)

Also provide an overall [LEVEL/SCORE] ([methodology]) with a brief explanation.

Text to evaluate:
"${text}"

Respond ONLY with valid JSON in this exact format:
{
  "overall": {
    "level": "B1",
    "explanation": "Overall level is determined by the lowest attribute score"
  },
  "attributes": {
    "attribute1": {
      "level": "B2",
      "feedback": "Descriptive feedback here"
    },
    "attribute2": {
      "level": "B1",
      "feedback": "Descriptive feedback here"
    },
    "attribute3": {
      "level": "B2",
      "feedback": "Descriptive feedback here"
    },
    "attribute4": {
      "level": "C1",
      "feedback": "Descriptive feedback here"
    }
  }
}
```

### Template 2: Audio/Speaking Evaluation Prompt

```
You are an expert [DOMAIN] evaluator using [STANDARD] standards.

Listen to the audio recording and evaluate the [SUBJECT] based on these [N] attributes:
1. [Attribute 1] - [description focused on audio aspects]
2. [Attribute 2] - [description focused on audio aspects]
3. [Attribute 3] - [description focused on audio aspects]
4. [Attribute 4] - [description focused on audio aspects]

For each attribute, provide:
- A [LEVEL/SCORE] ([range or options])
- Brief descriptive feedback (2-3 sentences)

Also provide an overall [LEVEL/SCORE] ([methodology]) with a brief explanation.

Respond ONLY with valid JSON in this exact format:
{
  "overall": {
    "level": "B1",
    "explanation": "Overall level is determined by the lowest attribute score"
  },
  "attributes": {
    "attribute1": {
      "level": "B2",
      "feedback": "Descriptive feedback here"
    },
    "attribute2": {
      "level": "B1",
      "feedback": "Descriptive feedback here"
    },
    "attribute3": {
      "level": "B2",
      "feedback": "Descriptive feedback here"
    },
    "attribute4": {
      "level": "B1",
      "feedback": "Descriptive feedback here"
    }
  }
}
```

---

## Best Practices

### 1. Be Specific and Prescriptive
- Don't assume the AI knows your scale - spell it out
- Provide examples in the format specification
- Use "ONLY" and "exact format" to enforce structure

### 2. Handle JSON Response Parsing

The AI might wrap JSON in markdown code blocks. Always clean the response:

```javascript
// Remove markdown code blocks if present
responseText = responseText
  .replace(/```json\s*/g, '')
  .replace(/```\s*$/g, '')
  .trim();

const evaluation = JSON.parse(responseText);
```

### 3. Define Clear Scoring Methodology

Examples:
- "Overall score is the **average** of all attributes"
- "Overall score is the **lowest** of all attributes" (conservative)
- "Overall score is the **median** of all attributes"
- "Overall score is **weighted**: 40% attribute1, 30% attribute2, etc."

### 4. Calibrate Feedback Length

Specify feedback length to control token usage and response time:
- "1 sentence" - very brief
- "2-3 sentences" - balanced (recommended)
- "1 paragraph" - detailed
- "Detailed analysis with examples" - comprehensive

### 5. Adjust for Domain

**Language Learning:**
- Use established frameworks (CEFR, ACTFL, ILR)
- Focus on communicative competence
- Include both form (accuracy) and function (fluency)

**Code Review:**
- Attributes: Correctness, Efficiency, Readability, Best Practices
- Scale: Critical/Major/Minor issues or 1-5 rating
- Include specific line references

**Writing Quality:**
- Attributes: Clarity, Coherence, Style, Grammar
- Scale: Letter grades, 1-10 scale, or proficiency levels
- Consider audience and purpose

**Customer Service:**
- Attributes: Empathy, Problem-solving, Professionalism, Completeness
- Scale: Excellent/Good/Needs Improvement
- Include compliance with company policies

---

## API Integration Patterns

### Text Input
```javascript
const message = await anthropicClient.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: prompt
  }]
});
```

### Audio Input
```javascript
const message = await anthropicClient.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: [
      {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'audio/webm', // or audio/wav, audio/mp3, etc.
          data: audioBase64
        }
      },
      {
        type: 'text',
        text: prompt
      }
    ]
  }]
});
```

### Image Input
```javascript
const message = await anthropicClient.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg', // or image/png, image/webp, etc.
          data: imageBase64
        }
      },
      {
        type: 'text',
        text: prompt
      }
    ]
  }]
});
```

---

## Customization Guide

### To adapt these prompts for your project:

1. **Replace the domain/standard:**
   - Change "English language evaluator using CEFR" to your domain
   - Examples: "Code quality evaluator", "Design critique expert", "Customer service analyst"

2. **Define your attributes:**
   - Choose 3-6 key dimensions relevant to your domain
   - Provide clear descriptions of what each measures

3. **Set your scoring scale:**
   - Numeric (1-10, 0-100)
   - Letter grades (A-F)
   - Levels (Beginner/Intermediate/Advanced)
   - Custom scale (your framework)

4. **Adjust feedback detail:**
   - Specify length (sentences, words, paragraphs)
   - Request specific elements (examples, suggestions, warnings)

5. **Customize the JSON structure:**
   - Add fields like: timestamp, recommendations, next_steps
   - Remove fields that aren't relevant
   - Nest data differently based on your UI needs

---

## Testing Your Prompts

### Checklist:
- [ ] Does the AI consistently return valid JSON?
- [ ] Are the scores/levels within your specified range?
- [ ] Is the feedback length appropriate?
- [ ] Does the feedback match the assigned level/score?
- [ ] Are all required fields present in the response?
- [ ] Does it handle edge cases (very short input, very long input, empty input)?

### Common Issues and Fixes:

**Issue:** AI returns markdown code blocks
- **Fix:** Add response cleaning code (see Best Practices #2)

**Issue:** Inconsistent scoring
- **Fix:** Add more examples in the prompt, clarify the scale

**Issue:** Feedback too generic
- **Fix:** Request specific examples or evidence from the input

**Issue:** Wrong JSON structure
- **Fix:** Make the format specification more explicit, add more example fields

---

## Example Use Cases

### 1. Essay Grading
- Attributes: Thesis, Evidence, Organization, Style, Grammar
- Scale: Letter grades or rubric points
- Overall: Weighted average or holistic assessment

### 2. Code Quality Review
- Attributes: Correctness, Efficiency, Readability, Maintainability
- Scale: 1-5 stars or Critical/Major/Minor
- Overall: Highest severity issue determines overall

### 3. Design Critique
- Attributes: Visual Hierarchy, Consistency, Accessibility, Innovation
- Scale: Excellent/Good/Needs Work
- Overall: Balanced assessment with actionable recommendations

### 4. Customer Service QA
- Attributes: Professionalism, Accuracy, Empathy, Resolution
- Scale: Pass/Fail with scoring
- Overall: Must pass all categories

### 5. Medical Documentation Review
- Attributes: Completeness, Accuracy, Clarity, Compliance
- Scale: Complete/Incomplete with severity
- Overall: Any critical issue flags the entire document

---

## Advanced Techniques

### 1. Multi-Turn Evaluation
For complex evaluations, break into phases:
1. Initial assessment (generates scores)
2. Detailed feedback (expands on scores)
3. Recommendations (actionable next steps)

### 2. Comparative Evaluation
Compare against a reference/benchmark:
```
Compare this [INPUT] against the following reference [STANDARD_EXAMPLE].
Identify areas where it meets, exceeds, or falls short.
```

### 3. Rubric-Based Evaluation
Include a detailed rubric in the prompt:
```
Use this rubric for scoring:
- Level 5: [detailed criteria]
- Level 4: [detailed criteria]
- Level 3: [detailed criteria]
...
```

### 4. Context-Aware Evaluation
Provide context to adjust expectations:
```
Context: This is written by a [LEVEL/BACKGROUND] student/professional.
Evaluate accordingly with expectations appropriate for this level.
```

### 5. Multi-Dimensional Confidence
Ask for confidence scores:
```json
{
  "attribute1": {
    "level": "B2",
    "feedback": "...",
    "confidence": 0.85
  }
}
```

---

## Conclusion

These prompt templates provide a foundation for building AI-powered evaluation systems. The key principles are:

1. **Clarity** - Be explicit about what you want
2. **Structure** - Enforce consistent output format
3. **Examples** - Show the AI what good output looks like
4. **Validation** - Always validate and clean AI responses
5. **Iteration** - Test and refine your prompts based on results

Remember: Good prompts are the result of iteration. Start with these templates, test with real data, and refine based on the quality of responses you receive.

---

## License

This guide is provided as part of the CEFR English Evaluator project and can be freely adapted for your own projects.
