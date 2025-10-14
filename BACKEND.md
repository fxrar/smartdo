## Tech Stack

### Framework & Language

- Next.js 15 (App Router)
- TypeScript

### Database

- Supabase (hosted PostgreSQL)
- Prisma ORM (database client)

### AI

- Vercel AI SDK
- LLM integration (OpenAI/Anthropic)

### UI

- shadcn/ui components
- Tailwind CSS

## Detailed Directory Structure

```
task-ai-app/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Main tasks page
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts          # AI chat endpoint
│   │   │
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css
│   │
│   ├── features/
│   │   ├── tasks/
│   │   │   ├── components/
│   │   │   │   ├── task-card.tsx
│   │   │   │   ├── task-list.tsx
│   │   │   │   ├── create-task-dialog.tsx
│   │   │   │   └── task-filters.tsx
│   │   │   ├── actions.ts
│   │   │   └── types.ts
│   │   │
│   │   └── auth/
│   │       ├── components/
│   │       │   ├── login-form.tsx
│   │       │   └── signup-form.tsx
│   │       ├── actions.ts
│   │       └── types.ts
│   │
│   ├── ai/
│   │   ├── tools/
│   │   │   ├── create-task.ts
│   │   │   ├── list-tasks.ts
│   │   │   ├── update-task.ts
│   │   │   └── delete-task.ts
│   │   ├── agent.ts
│   │   └── prompts.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── checkbox.tsx
│   │   │
│   │   ├── chat/
│   │   │   ├── chat-interface.tsx
│   │   │   └── message-list.tsx
│   │   │
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       └── navbar.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── ai.ts
│   │   └── utils.ts
│   │
│   └── types/
│       └── index.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│   ├── favicon.ico
│   └── images/
│
├── .env
├── .env.example
├── .gitignore
├── components.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── middleware.ts                     # Clerk middleware
└── README.md

```

## Notes

Will add detailed schemas, API endpoints, and database models once we finalize the exact data structure and flow logic. For now this is the foundation we're building on.