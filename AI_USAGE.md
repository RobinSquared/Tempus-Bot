## AI Usage Rules

These rules apply to ALL AI activity in this repository, including inspection, analysis, planning, documentation, uncommitted edits, prototypes, tests, code review, code generation, commits, and pull requests.

### Authority and Approval

- This project has one maintainer. Contributors MUST contact the maintainer directly and privately to obtain approval where this policy requires it.
- Before requesting approval for AI implementation, a contributor MUST give the maintainer a proposed implementation plan and a complete scope of changes. The scope MUST identify:
  - The total number and paths of all files expected to be created, edited, renamed, or deleted.
  - The estimated number of AI-generated, added, modified, and deleted lines in each file.
  - Any expected changes to dependencies, configuration, database schemas, runtime behavior, permissions, data handling, and tests.
- Approval applies only to the reviewed plan and scope. If the planned file list, estimated size, behavior, or other material scope changes, AI work MUST pause until the contributor obtains renewed maintainer approval.
- An initial request or prompt asking AI to implement something does NOT count as maintainer approval. If the maintainer is directly using the AI, approval must still be explicit and must follow the AI presenting the required plan and scope.
- The contributor is responsible for obtaining and accurately representing private maintainer approval. AI MUST NOT infer approval from a request, a person's role, or approval granted for different work.

### Definitions

- A **whole production feature** is any complete new runtime or user-facing capability, regardless of how many files it changes. For example, adding a complete welcome function to the existing `guildMemberAdd` event is a whole production feature.
- A **substantial rewrite** changes an existing command file's primary behavior or interaction contract, replaces its main execution logic, or recreates most of the file instead of making localized edits.

### Allowed Uses

The Review Requirements and Not Allowed sections override this section.

- AI CAN be used for general maintenance tasks, such as small refactors, formatting cleanup, dependency notes, or mechanical migrations.
- AI CAN be used to convert existing behavior to a newer implementation style, such as converting Discord embeds to Discord components or converting existing output into generated images, provided the work is not a whole production feature or substantial command rewrite that lacks approval.
- AI CAN edit existing command files when the edits are localized and do not amount to a substantial rewrite or create a whole production feature.
- AI CAN be used to inspect, compare, and summarize legacy code for migration planning.
- AI CAN be used to draft or revise Markdown documentation.
- AI CAN be used to generate commit messages, PR descriptions, changelogs, and issue summaries.
- AI CAN be used to summarize code into human-readable comments or notes.
- AI CAN read and edit database schemas, example configuration files such as `config.example.json`, and synthetic test data.
- AI CAN implement a security, moderation, permission, or data-retention decision that the maintainer has already made and explicitly specified, but AI cannot choose or alter that decision.

### Review Requirements

- Every contiguous block of AI-assisted or AI-generated changes MUST have a disclosure comment immediately above it using the file format's native comment syntax. A wholly AI-generated file MUST have the disclosure comment at the top. If a file format does not support comments, the disclosure MUST be placed in an adjacent Markdown file and identify the affected file and changes.
- PR descriptions MUST include `AI-assisted: yes/no`.
- AI-assisted code MUST be reviewed and understood by the contributor and project maintainer before it is committed. The contributor is responsible for obtaining that review, and the maintainer controls whether the work is merged.
- AI-assisted runtime changes SHOULD be tested manually or with automated checks before release.
- AI-assisted command, interaction, moderation, logging, or giveaway changes MUST be tested manually in Discord by the contributor, not by AI, before release.
- AI-assisted changes MUST preserve existing behavior unless the change is intentional, included in the approved scope where approval is required, and documented.

### Real Data and Configuration

- NO real bot tokens, secrets, private messages, private Discord logs, production configuration, or real sensitive or personally identifiable user data may be exposed to AI.
- AI MUST NOT open, read, search, copy, transform, or store the contents of `config.json` or any other production configuration or secret file. AI may inspect whether a prohibited file exists without reading its contents.
- AI may work with schemas, `config.example.json`, documentation, and wholly synthetic data that does not originate from real users or production systems.
- AI may write code that processes real data at runtime only from approved requirements and schemas; no real values or records may be provided to the AI while doing so.

### Not Allowed

- AI CANNOT generate a whole production feature, create a new command file, or substantially rewrite an existing command file without the private maintainer approval defined above.
- AI CANNOT make security, moderation, permission, or data-retention decisions. If a required decision has not already been explicitly made by the maintainer, AI may identify the issue and present options, but it MUST NOT select an option or continue on an assumption.
- AI CANNOT be given or access real bot tokens, secrets, private messages, private Discord logs, production configuration, or real sensitive or personally identifiable user data.
- AI-generated code CANNOT be committed before the contributor and project maintainer has reviewed and confirmed that they understand it.
