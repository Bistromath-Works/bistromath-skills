---
name: presentation-strategist
description: Strategic presentation development and content planning. Use when users ask for help developing, outlining, or structuring presentations, especially for AI adoption training, mortgage industry topics, or educational/business presentations. Focuses on narrative structure, content strategy, and audience-specific frameworks rather than slide creation.
---

# Presentation Strategist

## Overview

This skill guides strategic presentation development - the planning, structuring, and content organization that happens before slide creation. It helps develop compelling narratives, select appropriate frameworks, and create detailed content outlines ready to be built in presentation tools like Gamma.app.

**Primary use cases:**
- AI adoption and training presentations (especially for mortgage industry)
- Mortgage industry educational content
- Business presentations, keynotes, and conference talks
- Teaching and training materials

**This skill does NOT:**
- Create PowerPoint/slide files (use the `pptx` skill for that)
- Focus on visual design specifics

## Presentation Development Workflow

Follow this workflow for all presentation development requests:

### Step 1: Discovery & Understanding

Gather essential information about the presentation:

**Ask about:**
1. **Purpose** - What's the goal? (educate, persuade, inform, inspire)
2. **Audience** - Who will attend? What's their background and needs?
3. **Context** - Where and when will this be presented? (conference, training, meeting)
4. **Duration** - How long? (affects depth and slide count)
5. **Key Message** - If they had to remember one thing, what should it be?
6. **Constraints** - Any must-include topics? Things to avoid?

**For AI adoption presentations, also ask:**
- Current AI adoption level (none, exploring, some users, widespread)
- Audience sentiment (excited, skeptical, resistant, mixed)
- Specific AI tools or systems being introduced
- Industry/workflow context (will usually be mortgage-related)

**For mortgage industry presentations, also ask:**
- Target role (loan officers, processors, underwriters, operations)
- Specific mortgage topic or process
- Regulatory considerations
- Technical depth needed

**Note:** Don't overwhelm with questions. Start with 3-4 most critical questions, then follow up as needed.

### Step 2: Framework Selection

Based on discovery, select the most appropriate framework. Read the relevant reference file:

**For AI adoption presentations:**
- Read `references/ai-adoption-frameworks.md`
- Read `references/mortgage-context.md` (if mortgage-related)
- Select framework based on audience resistance level and presentation goal

**For general presentations:**
- Read `references/general-frameworks.md`
- Use the Framework Selection Guide to choose appropriate structure

**Common framework mappings:**
- AI training for skeptical audience → "AI Adoption Bridge" or "Proof-First Approach"
- AI training for enthusiasts → "Deep Dive & Advanced Applications"
- Mortgage education → "Explain-Demo-Practice"
- Business pitch → "Problem-Solution-Benefit"
- Keynote → "Hook-Journey-Insight"
- Strategic planning → "Situation-Complication-Resolution"

### Step 3: Outline Development

Create a detailed presentation outline with:

1. **Presentation Overview**
   - Title (compelling and descriptive)
   - Core message/thesis
   - Target audience
   - Estimated duration
   - Selected framework

2. **Slide-by-Slide Outline**
   
   For each slide or slide section, provide:
   - **Slide number and title** (title should convey the point, not just topic)
   - **Key message** (what this slide communicates)
   - **Content elements** (bullets, data points, examples)
   - **Visual suggestions** (chart type, image concept, layout idea)
   - **Speaker notes** (talking points, transitions, things to emphasize)

3. **Supporting Elements**
   - Opening hook strategy
   - Transition language between sections
   - Examples and stories to use
   - Data points or statistics (if available)
   - Anticipated questions and responses

**Slide count guidelines:**
- 15-minute presentation: 8-12 slides
- 30-minute presentation: 15-20 slides
- 45-minute presentation: 20-30 slides
- 60-minute training: 30-40 slides (more if interactive exercises)

Adjust based on presentation style (fewer for story-driven, more for data-heavy).

### Step 4: Content Development

Expand key slides with detailed content:

**For critical slides, provide:**
- Full draft text for headlines
- Detailed bullet points or paragraph content
- Specific examples with context
- Recommended visuals with descriptions
- Alternative framings if applicable

**Focus expansion on:**
- Opening slides (first impression is critical)
- Core message slides (the "heart" of the presentation)
- Complex concepts that need explanation
- Transition slides between major sections
- Closing/call-to-action slides

### Step 5: Review & Refinement

Present the outline and ask:
- Does this match your vision?
- What sections need more/less emphasis?
- Are there gaps in the narrative?
- Should we expand any areas?
- Any examples or analogies that would be particularly effective?

Iterate based on feedback.

## Output Format

Provide presentation outlines in clear, scannable markdown format:

```markdown
# [Presentation Title]

**Core Message:** [One sentence thesis]
**Audience:** [Description]
**Duration:** [Time]
**Framework:** [Selected framework]

---

## Opening (Slides 1-3)

### Slide 1: [Title]
**Message:** [Key point]
**Content:**
- [Bullet or content element]
- [Bullet or content element]

**Visual:** [Suggestion]
**Notes:** [Speaking notes]

### Slide 2: [Title]
[Similar structure]

---

## [Section Name] (Slides 4-8)

[Continue with similar structure]

---

## Closing (Slides X-Y)

[Structure as above]

---

## Additional Materials

**Examples to use:**
- [Specific example with context]

**Anticipated questions:**
- [Question]: [Suggested response]

**Resources to mention:**
- [Resource]: [When/how to reference]
```

## Specialized Guidance

### For AI Adoption Presentations in Mortgage Industry

**Key principles:**
1. **Make it concrete** - Use mortgage-specific examples (loan estimates, AUS, document review)
2. **Address job security fears directly** - Position as augmentation, not replacement
3. **Show quick wins** - What they can try today
4. **Use mortgage terminology** - Demonstrates you understand their world
5. **Quantify value in their terms** - Hours saved, loans processed, error reduction

**Reference the audience personas in mortgage-context.md** to tailor messaging.

**Common mortgage AI use cases to highlight:**
- Document extraction and data entry
- Loan file review and risk identification
- Compliance checking
- Borrower communication drafting
- Guideline lookup and interpretation
- Scenario comparison and analysis

### For Technical Mortgage Topics

**Considerations:**
- Regulatory implications should be addressed upfront
- Use decision trees for complex process explanations
- Include "what-if" scenarios
- Provide concrete examples with real (anonymized) documents
- Address common mistakes or misconceptions
- Include references to official guidelines when relevant

### For Conference/Keynote Presentations

**Differences from training presentations:**
- More narrative-driven, less instructional
- Personal stories and anecdotes critical
- Higher-level insights over tactical details
- Memorable moments over comprehensive coverage
- Leave them thinking, not just doing

## Reference Files

This skill includes comprehensive reference materials:

- **`references/ai-adoption-frameworks.md`** - Frameworks specifically for AI adoption presentations, change management, and addressing resistance. Essential for AI training presentations.

- **`references/mortgage-context.md`** - Mortgage industry workflows, terminology, pain points, and audience personas. Essential for mortgage-related presentations.

- **`references/general-frameworks.md`** - Proven presentation frameworks for various types (persuasive, educational, strategic, inspirational) with structure templates and best practices.

**When to read each:**
- Always read ai-adoption-frameworks.md for AI-related presentations
- Always read mortgage-context.md when the presentation is mortgage-related
- Read general-frameworks.md for non-AI presentations or to explore alternative frameworks

## Quality Checklist

Before finalizing a presentation outline, verify:

- [ ] Clear core message that can be stated in one sentence
- [ ] Logical flow with smooth transitions between sections
- [ ] Opening that hooks attention within first 2 minutes
- [ ] Concrete examples relevant to audience's experience
- [ ] Each slide title conveys a point, not just a topic
- [ ] Appropriate depth for time allocated
- [ ] Addresses likely objections or questions
- [ ] Clear call-to-action or takeaway
- [ ] Speaker notes for complex slides
- [ ] Recommended visuals support the message

## Common Pitfalls to Avoid

- **Too much content** - Trying to cover everything leads to covering nothing well
- **Generic examples** - "AI can help with tasks" vs. "AI can review a 30-page loan file in 2 minutes"
- **Ignoring audience concerns** - Especially for change management topics
- **Burying the lead** - Don't save the main point for the end
- **Death by bullet points** - Vary slide types and content formats
- **Forgetting transitions** - Help audience follow your logic
- **Weak opening** - First 2 minutes determine engagement level
- **No clear next steps** - Always end with something actionable
