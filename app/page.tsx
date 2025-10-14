import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="p-4 border-b">
        <nav className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Todlo</h1>
          <div className="flex items-center gap-4">
          </div>
        </nav>
      </header>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-bold mb-4">Welcome to Todlo</h2>
          <p className="text-gray-600 mb-8">
            A simple AI-powered task manager that helps you create and manage tasks with an AI assistant.
          </p>
          <div className="space-y-4">
            <Link href="/dashboard" className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Go to Dashboard
            </Link>
            <p className="text-sm text-gray-500">
              Sign in to access your tasks
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
