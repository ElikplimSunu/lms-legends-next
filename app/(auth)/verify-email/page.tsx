export const metadata = {
  title: "Verify Email | LMS Legends",
};

export default function VerifyEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Check Your Email</h1>
        <p className="text-zinc-500">
          We&apos;ve sent a verification link to your email address.
          Please click the link to verify your account.
        </p>
        <p className="text-sm text-zinc-400">
          Didn&apos;t receive the email? Check your spam folder or try
          registering again.
        </p>
        <a
          href="/login"
          className="inline-block text-sm text-blue-600 hover:underline"
        >
          Back to login
        </a>
      </div>
    </div>
  );
}
