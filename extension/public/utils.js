const nielsen_heuristics = `
1. Visibility of System Status - Does the user always know what's happening?
2. User Control and Freedom - Can the user easily undo or navigate away from actions?
3. Error Prevention - Are safeguards in place to prevent mistakes?
4. Recognition Rather Than Recall - Are all important options, actions, and information clearly visible on the screen, 
or is the user forced to remember things from previous screens or steps in the process?
5. Consistency and Standards - Are design patterns consistent throughout the app?
6. Match Between System and The Real World - Does the design use words, concepts and visuals that are familiar to the user, 
or does it rely on technical terms or system jargon that might be confusing?
7. Helps Users Recognize, Diagnose, and Recover from Errors - Are error messages clear and helpful?
8. Flexibility and Efficiency of Use - Does the design offer shortcuts or advanced options to help experienced users work faster, 
while still remaining simple and accessible for new users?
9. Aesthetic and Minimalist Design - Does the design avoid unnecessary information and distractions?
10. Help and Documentation - Is there clear help or guidance where needed?`;

const system_prompt = `
You are a UX/UI expert tasked with detecting usability issues in a web application by reviewing it for compliance with Nielsen's heuristics.
You are given image(s) of a static web application to evaluate.`;

const request_for_evaluation = `
Review the design based on the following heuristics:
${nielsen_heuristics}

Detect and list distinct usability issues you observe in the provided screen(s).
For each issue, follow exactly this format:

[Title for the issue]  
Description: [A clear and concise explanation of the problem.]  
Severity: [A number from 0-4, where 0 = Not a usability problem at all, and 4 = Usability catastrophe; imperative to fix.]  
Suggestion: [A specific recommendation for fixing the issue.]

Guidelines:
- Only include a list of usability issues — no additional text, summaries, or sections.
- Do not repeat the same issue under different heuristics; instead, describe the issue once and consider all relevant aspects.
- It is acceptable to include multiple problems related to the same heuristic, as long as they are clearly distinct.
- Order the issues from highest to lowest severity.
- If applicable, also point out missing elements or changes that could improve the overall user experience.
`;

