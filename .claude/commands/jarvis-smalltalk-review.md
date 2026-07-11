Show JARVIS Smalltalk compression statistics for this session.

Steps:
1. Resolve workspace name: call `workspace-info` and extract the workspace name field
2. Call `smalltalk-stats workspace="<workspace_name>"`
3. Display the results:
   - Session tokens saved
   - Lifetime tokens saved
   - Estimated USD savings
   - Tweetable summary one-liner
4. If stats show 0 tokens saved: note that Smalltalk compression may be off — suggest running `/jarvis-smalltalk-toggle` to enable it
