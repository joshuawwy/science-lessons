# Lesson Generator Agent Specification

## Agent Name: `lesson-generator`

## Purpose
Generate interactive, MathAcademy-style lesson content from existing lesson plan markdown files, following the "I Do → You Do" instructional pattern.

## Input Parameters
1. `topicId` - The topic identifier (e.g., "Scientific-Inquiry-Skills")
2. `lessonNumber` - The lesson number (1, 2, or 3)
3. `lessonPlanPath` - Path to the lesson plan markdown file

## Process

### 1. Read and Parse Lesson Plan
- Read the lesson plan markdown file (e.g., `part-1-lesson-plan.md`)
- Extract the three cycles (CYCLE 1, CYCLE 2, CYCLE 3)
- Identify "I DO" examples and "YOU DO" practice sections
- Parse learning objectives and content overview

### 2. Generate Content Cards

The agent should generate 15-20 cards following this structure:

#### Card Types and Order:
1. **Introduction Card** (1 card)
   - Welcome message
   - Brief overview of topic
   - Lesson number indication

2. **Learning Objective Card** (1 card)
   - Clear, bullet-pointed objectives
   - What students will be able to do

3. **CYCLE 1: Basic Concepts** (4 cards)
   - I Do Example #1A: Teacher demonstration
   - I Do Example #1B: Similar pattern demonstration
   - You Do Practice #1: Simple interactive exercise
   - You Do Practice #2: Another simple practice

4. **CYCLE 2: Building Complexity** (4 cards)
   - I Do Example #2A: More complex demonstration
   - I Do Example #2B: Extended application
   - You Do Practice #3: Intermediate difficulty
   - You Do Practice #4: Applied practice

5. **CYCLE 3: Complex Integration** (4 cards)
   - I Do Example #3A: Complex integration
   - I Do Example #3B: Advanced application
   - You Do Practice #5: Challenge problem
   - You Do Practice #6: Mastery demonstration

6. **Summary Card** (1 card)
   - Key takeaways
   - Progress acknowledgment
   - Next steps

### 3. Interactive Elements

For "You Do" cards, generate appropriate interactive elements:

#### Input Type
- Simple text input for factual answers
- Validation against correct answers
- Immediate feedback

#### Practice Type
- Text area for observations, explanations
- No strict validation (record for review)

#### Quiz Type (future enhancement)
- Multiple choice questions
- Drag and drop matching
- True/false questions

### 4. Content Enhancement

Apply these enhancements to the content:

#### Visual Elements
- Use HTML formatting for clarity
- Include bullet points, numbered lists
- Highlight key terms with `<strong>` or `<em>`
- Add visual breaks between sections

#### Progressive Difficulty
- CYCLE 1: Foundation concepts, simple language
- CYCLE 2: Build on CYCLE 1, introduce complexity
- CYCLE 3: Integrate all concepts, real-world application

#### Consistent Language
- Use "Watch as I..." for I Do sections
- Use "Now it's your turn..." for You Do sections
- Maintain encouraging, supportive tone

### 5. Output Format

Return JSON structure:
```json
{
  "cards": [
    {
      "id": "unique-id",
      "type": "intro|objective|i-do|you-do|summary",
      "cycle": 1|2|3, // only for i-do and you-do
      "title": "Card Title",
      "content": "HTML formatted content",
      "interactive": {
        "type": "input|practice|quiz",
        "question": "Question text",
        "correctAnswer": "Expected answer", // for input type
        "options": ["A", "B", "C", "D"], // for quiz type
        "feedback": "Feedback message"
      }
    }
  ],
  "totalCards": 15,
  "metadata": {
    "topicName": "Human-readable topic name",
    "lessonNumber": 1,
    "estimatedTime": "20-30 minutes"
  }
}
```

## Example Agent Call

```typescript
const lessonContent = await callLessonGeneratorAgent(
  'Scientific-Inquiry-Skills',
  1,
  'plans/01-Scientific-Inquiry-Skills/part-1-lesson-plan.md'
);
```

## Quality Criteria

1. **Alignment**: Content must align with lesson plan objectives
2. **Clarity**: Language appropriate for target grade level
3. **Interactivity**: Each You Do section must be engaging
4. **Progression**: Clear difficulty progression across cycles
5. **Feedback**: Constructive, encouraging feedback messages
6. **Completeness**: All three cycles must be fully developed

## Implementation Notes

- Parse existing lesson plans to maintain consistency
- Generate age-appropriate examples and language
- Create realistic scientific scenarios for practice
- Ensure interactive elements test understanding, not memorization
- Provide hints or scaffolding for struggling students
- Track common misconceptions and address them

## Future Enhancements

1. **Adaptive Difficulty**: Adjust based on student performance
2. **Visual Simulations**: Embed interactive science simulations
3. **Voice Narration**: Add audio explanations for I Do sections
4. **Collaborative Features**: Peer review and discussion
5. **Assessment Integration**: Generate formal assessments from lesson content