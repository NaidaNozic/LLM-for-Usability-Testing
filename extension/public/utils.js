/* Prompts for the heuristic evaluation */
const system_prompt = `You are a UX/UI expert evaluating a screen of a web application based on all 10 Nielsen's heuristics.`;

const nielsen_heuristics = `
- Is there anything missing or unclear on the screen that might make the user unsure about the current status or progress of the system?
- Is anything preventing the user from going back, cancelling, or undoing an action if they make a mistake?
- Which safeguards for preventing user mistakes are missing or are unclear?
- Are there places where the user is forced to remember information rather than seeing it clearly on the screen?
- Are there places where design patterns and terminology are not consistent?
- Are there elements of the screen that might feel unfamiliar or confusing to the user based on real-world expectations?
- If there are existing error indicators, in what why do any of them fail to explain what went wrong or how the user can fix it?
- What parts of the screen lack in shortcuts or advanced features for experienced users?
- Are there elements on the screen that feel unnecessary, distracting, or add visual noise?
- Are there situations where users may struggle to find help or guidance when they need it? 
`;

const request_for_evaluation = `
Identify usability issues on the screen using Nielsen's heuristics as evaluation criteria, 
focusing only on elements visible before any user interaction.
Use the following questions as guidance to help you explore the interface from multiple angles. 
You are NOT limited to one issue per question — you may identify multiple issues inspired by a single question, 
and some issues may relate to more than one question: `;

const output_format = `
### Output Format:
For each issue, include the following, without headings, categories, or extra recommendations:

- **Title of the issue**
- **Short description of the issue** (1-2 sentences)
- **Severity Rating** (0-4, where 0 = Not a problem, 4 = Critical issue)
- **Recommendation for Fixes** (**mandatory**: provide a **specific, actionable fix** — not a generic suggestion. 
    Example: Instead of saying "improve navigation", say "Add a 'Home' button in the top navigation bar".)

### Example Output:

Issues:

1. **Error Prevention**: No "Cancel" button during checkout, preventing users from exiting without completing the purchase.  
   Severity: 2  
   Recommendation: Add a prominent "Cancel" button during the checkout process to allow users to safely exit without making a purchase.`;

/* Prompts for the cognitive walkthrough */
const system_walkthrough_prompt =`You are a UX/UI expert conducting a cognitive walkthrough of a web application to identify usability 
issues related to task completion from a user's perspective.`;

const walkthrough_questions = `
- What aspects of the interface might confuse the user when trying to complete the task and figure out the what's the correct action?  
- What is missing or unclear before the user interacts with anything?
- What might the user try instead of the correct action, and why?  
- Which part of the workflow or screen makes the user unsure if they are making progress on the task?`;

const request_walkthrough = `Identify usability issues (5 or more) a user may face when attempting the task.

Use the following questions as guidance to help you explore the interface from multiple angles. 
You are NOT limited to one issue per question — you may identify multiple issues inspired by a single question, 
and some issues may relate to more than one question:`;

const output_format_walkthrough = `
### Output Format:
For each issue, include the following, without headings, categories, or extra recommendations:

- **Title of the issue**
- **Short description of the issue** (1-2 sentences)
- **Severity Rating** (0-4, where 0 = Not a problem, 4 = Critical issue)
- **Recommendation for Fixes** (**mandatory**: provide a **specific, actionable fix** — not a generic suggestion. Example: Instead of saying "improve navigation", say "Add a 'Home' button in the top navigation bar".)

### Example Output:

Issues:

1. **Confusing Button Labels**: There are two identical buttons, which could confuse users about their functions and the differences between them.  
   Severity: 4  
   Recommendation: Change the button labels to clearly describe their specific functions (e.g., “Save Draft” vs. “Submit”).`;