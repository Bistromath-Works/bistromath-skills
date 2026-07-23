---
name: offer-extractor
description: Generate professional mortgage client emails for your loan team. Extracts data from accepted offers and mortgage scenarios to create personalized emails with loan parameters, timelines, documentation checklists, and next steps. Use when processing purchase offers, refinance applications, or any mortgage client communication that requires extracting deal details and generating client-facing emails.
---

# Offer Extractor & Mortgage Client Communication

Extract data from accepted offers and mortgage scenarios, then generate professional, personalized client emails with accurate timelines, documentation requirements, and next steps.

## Company Context

**Team:** [YOUR TEAM NAME] at [YOUR COMPANY]
**Primary Contact:** [OPERATIONS CONTACT NAME], [TITLE]
- Email: [CONTACT EMAIL]
- Branch Inbox: [TEAM INBOX EMAIL]
- Phone: [PHONE]

> Customize: replace the bracketed placeholders above (and in references/email_templates.md) with your own team's details before first use.

## Core Workflow

When a user uploads an accepted offer or mortgage scenario:

1. **Classify the transaction type** - Purchase or refinance
2. **Extract key data points** from the document
3. **Calculate timeline** based on transaction type
4. **Determine documentation requirements** based on loan type
5. **Generate professional email** using templates and extracted data

## Step 1: Classify Transaction Type

**Purchase Transaction Indicators:**
- Accepted offer or purchase contract present
- Closing date specified
- Purchase price and down payment mentioned
- Property address for a new home purchase

**Refinance Transaction Indicators:**
- Current homeowner
- Existing loan being replaced
- Cash-out or rate/term refinance mentioned
- No purchase contract

If unclear, ask the user to clarify.

## Step 2: Extract Key Data Points

### Universal Data Points
- Client name(s)
- Property address (if purchase)
- Loan amount
- Loan type (Conventional, FHA, VA, USDA, Jumbo, DSCR, Bank Statement)
- Interest rate (if available)
- Estimated monthly payment (if available)

### Purchase-Specific Data Points
- Purchase price
- Down payment amount and percentage
- Closing date (CRITICAL for timeline calculations)
- Earnest money deposit amount
- Contract contingencies and their deadlines:
  - Inspection contingency deadline
  - Financing contingency deadline
  - Appraisal contingency deadline
  - Other condition removal dates
- Special conditions or addendums

### Refinance-Specific Data Points
- Current loan balance
- Estimated new loan amount
- Purpose (rate/term, cash-out, debt consolidation)
- Desired closing timeframe

### Property Details
- Property type (single family, condo, townhouse, multi-unit)
- HOA (yes/no)
- Rural location (relevant for USDA, well/septic inspections)

## Step 3: Calculate Timeline

**For Purchase Transactions:**
Read `references/timeline_calculations.md` to calculate:
- Closing date (from offer)
- Cleared to Close (CTC) date = Closing - 10 business days
- Final resubmission date = CTC - 5 calendar days
- Initial resubmission date = 3 days from Chris meeting
- Rate lock availability = 30 days before closing (exclude weekends/holidays, round forward)

Present dates in order with clear labels and urgency indicators.

**For Refinance Transactions:**
- Documentation deadline: 48 hours after Chris contact
- Expected closing: 30 days maximum from complete file

## Step 4: Determine Documentation Requirements

Read `references/documentation_requirements.md` to generate a customized checklist based on:
- Loan type (Conventional, FHA, VA, USDA, Jumbo, DSCR, Bank Statement)
- Employment type (W-2, self-employed)
- Property characteristics (rural, condo, HOA, well/septic)

### Special Considerations

**Government loans (VA, FHA, USDA):**
- Always ask user about additional property requirements
- Common additions: well/septic inspection, termite inspection, property repairs
- More stringent property standards

**Self-employed borrowers:**
- 2 years business and personal tax returns
- Year-to-date P&L
- Business license
- Additional documentation

**Investment properties (DSCR):**
- No personal income docs required
- Lease agreements
- Property income documentation
- Entity docs if LLC-owned

## Step 5: Generate Professional Email

Read `references/email_templates.md` for complete formatting guidelines.

### Email Components

1. **Subject line** - Include estimated read time and urgency
2. **Opening** - Congratulatory (purchase) or professional (refinance)
3. **Loan parameters** - Clean formatted breakdown with emojis for visual breaks
4. **Timeline** - Organized dates with clear labels and emphasis on hard deadlines
5. **Documentation checklist** - Customized based on loan type, with checkboxes
6. **operations contact introduction** - Role, contact info, when to reach out
7. **Next steps** - Clear action items with specific deadlines

### Formatting Standards

- Use emojis sparingly for section breaks (📅 💰 📄 ✅ ⚠️ 👤)
- Bold important dates and dollar amounts
- Bullet points for all lists
- Short paragraphs (2-3 sentences)
- Whitespace between sections
- Checkboxes [ ] for action items
- Highlight hard deadlines with ⚠️

### Tone Guidelines

**Purchase:** Congratulatory, friendly, firm on deadlines
**Refinance:** Professional, efficient, speed-focused

## Privacy & Security - CRITICAL

**NEVER include in emails:**
- Social security numbers
- Dates of birth
- Credit scores
- Credit report details
- Specific account balances (beyond general loan overview)

If any of these seem relevant, explicitly ask the user whether to include them and clearly state this puts the privacy risk on their decision.

## User Interaction Protocol

### Always Ask About:
- Government loan special requirements (VA, FHA, USDA)
- Property-specific needs (well/septic, surveys, inspections)
- Client-specific circumstances that affect documentation
- Whether user wants calendar invites generated for key dates

### Flag for Review:
- Timeline calculations that seem unrealistic (closing < 20 days away)
- Missing critical information (closing date, loan amount, etc.)
- Unusual loan scenarios or special circumstances

### Offer Proactively:
- Calendar invite generation for key dates
- Follow-up email templates for document reminders
- Explanation of any timeline or documentation requirements

## Quality Assurance

Before finalizing each email, verify:
- [ ] No personal/private data included
- [ ] Timeline calculations are accurate (business days vs calendar days)
- [ ] Documentation list matches loan type
- [ ] operations contact information is correct
- [ ] Subject line includes read time and ACTION REQUIRED
- [ ] Email formatting is clean with proper whitespace
- [ ] Next steps are clear with specific dates
- [ ] Hard deadlines are prominently highlighted

## Bundled Resources

### References

**`documentation_requirements.md`**
Comprehensive documentation checklists for each loan type:
- Universal requirements (all loans)
- Conventional, FHA, VA, USDA, Jumbo, DSCR, Bank Statement
- Self-employed vs W-2 employee requirements
- Property-specific additions

Load when: Generating documentation checklist section of email.

**`timeline_calculations.md`**
Complete timeline calculation formulas and rules:
- Purchase transaction timeline formulas
- Refinance transaction timeline
- Business day calculation rules
- Federal holiday list
- Timeline presentation formats

Load when: Calculating dates for purchase transactions or need to understand business day rules.

**`email_templates.md`**
Email structure templates and formatting guidelines:
- Subject line formulas
- Section-by-section templates for purchases and refinances
- Formatting best practices
- Tone guidelines
- Privacy reminders

Load when: Generating the final email output to ensure proper structure and formatting.

## Implementation Notes

**For users:** This skill works best when you upload clear, complete documents (PDFs or Word docs) containing the offer details. The more complete the information, the better the output.

**Edge cases:**
- If closing date is missing from purchase offer, ask user before proceeding
- If loan type is unclear, ask user to clarify
- For unique loan scenarios not covered in documentation requirements, ask user what's needed

**Keep It Simple:** Follow KISS principle - clear, actionable communication that moves the loan process forward efficiently.
