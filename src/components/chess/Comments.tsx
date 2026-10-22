import { useState } from "react";
import { cleanComment, type Comment } from "@/lib/comments";

export function Comments({
  messages,
  onSend,
  disabled = false,
  names,
}: {
  messages: Comment[];
  onSend: (text: string, name: string) => Promise<void>;
  disabled?: boolean;
  names: string[];
}) {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState(names[0] ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section
      className="w-full max-w-[600px] rounded-2xl bg-card border-2 border-border p-4"
      aria-label="Comments"
    >
      <ul aria-live="polite" className="max-h-48 overflow-y-auto space-y-2 break-words">
        {messages.map((m) => (
          <li key={m.id}>
            <strong>{m.name}: </strong>
            {m.text}
          </li>
        ))}
      </ul>
      <form
        className="flex flex-wrap gap-2 mt-2"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setBusy(true);
          try {
            await onSend(cleanComment(text), author);
            setText("");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Comment could not be sent.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {names.length > 1 && (
          <select
            aria-label="Comment as"
            className="rounded-lg border-2 border-border bg-card p-2"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          >
            {names.map((name, i) => (
              <option key={i}>{name}</option>
            ))}
          </select>
        )}
        <input
          aria-label="Write a comment"
          placeholder="Write a comment"
          maxLength={200}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border-2 border-border bg-card p-2"
          disabled={disabled || busy}
        />
        <button
          disabled={disabled || busy || !text.trim()}
          className="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-bold disabled:opacity-50"
        >
          Send
        </button>
      </form>
      {error && (
        <p role="alert" className="text-destructive mt-2">
          {error}
        </p>
      )}
    </section>
  );
}
