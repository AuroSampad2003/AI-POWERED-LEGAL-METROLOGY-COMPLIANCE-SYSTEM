import { Home, MoveLeft, SearchX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5faf7] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#dceee1] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9f8ef] text-[#14532D]">
          <SearchX className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#16A34A]">404 error</p>
        <h1 className="mt-2 text-2xl font-bold text-[#101A2E]">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-[#47536B]">
          The address you opened does not match an available PackSure AI page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E4E7EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#101A2E] hover:border-[#14532D]"
          >
            <MoveLeft className="h-4 w-4" />
            Go back
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f4023]"
          >
            <Home className="h-4 w-4" />
            Open dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;