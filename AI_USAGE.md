## AI Usage Rules
These rules apply to contributions made to this repository.

### Allowed Uses
- AI CAN be used for general maintenance tasks, such as small refactors, formatting cleanup, dependency notes, or mechanical migrations.
- AI CAN be used to convert existing behavior to a newer implementation style, such as converting Discord embeds to Discord components or converting existing output into generated images.
- AI CAN be used to inspect, compare, and summarize legacy code for migration planning.
- AI CAN be used to draft or revise Markdown documentation.
- AI CAN be used to generate commit messages, PR descriptions, changelogs, and issue summaries.
- AI CAN be used to summarize code into human-readable comments or notes.

### Review Requirements
- AI usage MUST be disclosed in the relevant commit, PR, changelog, or README section.
- PR descriptions MUST include `AI-assisted: yes/no`.
- AI-assisted code MUST be reviewed and understood by the project maintainer before release.
- AI-assisted runtime changes SHOULD be tested manually or with automated checks before release.
- AI-assisted command, interaction, moderation, logging, or giveaway changes MUST be tested manually in Discord before release.
- AI-assisted changes MUST preserve existing behavior unless the change is intentional and documented.

### Not Allowed
- AI CANNOT be used to silently generate whole production features or command files without explicit maintainer approval.
- AI CANNOT be used to handle, transform, or store real bot tokens, secrets, private messages, or sensitive user data.
- AI CANNOT be used to make security, moderation, permission, or data-retention decisions without maintainer review.
- AI-generated code CANNOT be committed if the maintainer does not understand what it does.
- Private Discord logs, user data, or production config MUST NOT be pasted into AI tools.