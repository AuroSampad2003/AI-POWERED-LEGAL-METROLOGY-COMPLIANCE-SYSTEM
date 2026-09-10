import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFBFA] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EBECEC]">
          <svg className="h-5 w-5 text-[#9099A8]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="14" height="12" rx="1.5" />
            <path d="M3 8h14" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[#14532D]">Coming soon</p>
        <h1 className="mt-2 text-2xl font-bold text-[#101A2E]">This page will be available in a later phase</h1>
        <p className="mt-2 text-sm text-[#47536B]">
          This part of the platform is still being built. Please check back soon.
        </p>
        <div className="mt-6 flex justify-center gap-2.5">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-[#E4E7EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#101A2E] hover:border-[#14532D]"
          >
            Go back
          </button>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f4023]"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;