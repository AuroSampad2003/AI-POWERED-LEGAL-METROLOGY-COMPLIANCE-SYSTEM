import DashboardLayout from './DashboardLayout';
import EmptyState from './EmptyState';

const PlaceholderPage = ({ title, description, note }) => (
  <DashboardLayout>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h2 className="font-display text-2xl font-semibold text-ink-900">{title}</h2>
      {description && <p className="text-sm text-ink-500 mt-1.5">{description}</p>}

      <div className="bg-surface border border-ink-200 rounded-xl mt-6">
        <EmptyState
          title="This section is under development"
          message={note || 'It will be available in a later phase of the platform.'}
        />
      </div>
    </div>
  </DashboardLayout>
);

export default PlaceholderPage;
