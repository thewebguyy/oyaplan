import Link from "next/link";

interface PageErrorProps {
  message?: string;
  href?: string;
  linkLabel?: string;
}

export default function PageError({
  message = "Something went wrong loading this page.",
  href = "/",
  linkLabel = "Go back home",
}: PageErrorProps) {
  return (
    <main className="min-h-screen bg-surface-grey flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div role="alert" className="p-8 bg-white border border-border-default rounded-2xl space-y-4">
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <span className="text-lg">⚠️</span>
          </div>
          <div className="space-y-2">
            <h1 className="type-subheading text-text-primary">Something went wrong</h1>
            <p className="type-body text-text-muted">{message}</p>
          </div>
          <Link
            href={href}
            className="inline-block w-full py-3 bg-brand-green text-white type-label rounded-xl hover:bg-[#006e42] transition-colors"
          >
            {linkLabel}
          </Link>
        </div>
        <p className="type-caption text-text-muted">
          If this keeps happening, the issue usually resolves in a few minutes.
        </p>
      </div>
    </main>
  );
}
