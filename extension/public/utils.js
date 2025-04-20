const nielsen_heuristics = `
N1 Visibility of System Status - Does the user always know what's happening?
N2 User Control and Freedom - Can the user easily undo or exit actions?
N3 Error Prevention - Are there clear safeguards to prevent mistakes?
N4 Recognition Rather Than Recall - Is important information visible, or must the user remember steps?
N5 Consistency and Standards - Are design patterns and terminology consistent?
N6 Match Between System and the Real World - Does the design use familiar language and visuals?
N7 Helps Users Recognize, Diagnose, and Recover from Errors - Are error messages clear and helpful?
N8 Flexibility and Efficiency - Are there shortcuts or advanced features for experienced users?
N9 Aesthetic and Minimalist Design - Is the interface free from unnecessary clutter?
N10 Help and Documentation - Is help clearly available where needed?
`;

const system_prompt = `
You are a UX/UI expert evaluating a static screen of a web application based on all 10 Nielsen's heuristics.
`;

const request_for_evaluation = `
Detect usability issues on the screen by using all 10 heuristics below as the evaluation criteria.
Sort the detected issues by **Impact** (highest to lowest, with highest being at the top of the list):
${nielsen_heuristics}

Format each issue exactly as:
Description: [Concise explanation of the visible problem.]  
Severity: [0-4, where 0 = Not a problem, 4 = Critical issue. Explain why this score was given with a specific usa case.]  
Frequency: [0-4, where 0 = Rare or edge case, 4 = Affects nearly all users frequently. Explain why this score was given with a specific usa case.]  
Persistence: [0-4, where 0 = Temporary or easily resolved, 4 = Long-lasting or hard to recover from. Explain why this score was given with a specific usa case.]  
Impact: [Sum of Severity + Frequency + Persistence]

After listing all issues, provide a separate list of **Suggestions**:
- Each suggestion should relate to a listed issue or propose an improvement based on what's missing from the visible screen.
- Suggestions may include reminders for elements that are not shown but are typically important to include (e.g., help, error handling), without assuming they are missing globally.

Guidelines:
- Only include the issue list and the suggestion list. No extra summaries or text.
- Do not duplicate the same issue under multiple heuristics.
- It's okay and recommended to include multiple distinct issues under one heuristic.
`;

/* Prompts for the cognitive walkthrough */
const system_walkthrough_prompt =`You are a UX/UI expert conducting a cognitive walkthrough of a web application to identify usability 
issues related to task completion from a user's perspective.`;

const request_walkthrough = `Identify usability issues a user may face when attempting the task.

Use the following question as guidance to help you explore the interface from multiple angles. 
You are NOT limited to one issue per question — you may identify multiple issues inspired by a single question, 
and some issues may relate to more than one question:

- What aspects of the interface might confuse the user when trying to complete the task and figure out the what's the correct action?  
- What is missing or unclear before the user interacts with anything?
- What might the user try instead of the correct action, and why?  

### Output Format:
Provide only a **plain enumerated list of distinct issues** (5 or more issues), without headings, categories, or extra recommendations.  
Each issue should be written in **1-2 short sentences** and must reflect how a user might **perceive, interpret, or react** to the screen.

### Example Output:

Issues:
1. There are two identical buttons, which could confuse users about their functions and the differences between them.  
2. Nothing is labeled and it might be unclear to the user what button might lead to where. Adding tooltips or labels might help.  
3. The upload icon is placed next to the profile picture, which could lead users to think both do the same thing.`;