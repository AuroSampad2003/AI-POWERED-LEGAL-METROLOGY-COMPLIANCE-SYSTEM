import { useEffect, useMemo, useState } from 'react';
import { Search, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import AdminDashboardLayout from '../components/admin/AdminDashboardLayout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => users.filter((item) => {
    const matchesRole = roleFilter === 'ALL' || item.role === roleFilter;
    const value = `${item.fullName} ${item.email}`.toLowerCase();
    return matchesRole && value.includes(query.toLowerCase());
  }), [query, roleFilter, users]);

  const updateRole = async (item) => {
    const role = item.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setBusyId(item._id);
    try {
      const response = await axiosInstance.patch(`/admin/users/${item._id}/role`, { role });
      setUsers((current) => current.map((user) => (
        user._id === item._id ? { ...user, role: response.data?.data?.role || role } : user
      )));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update user role.');
    } finally {
      setBusyId('');
    }
  };

  const removeUser = async (item) => {
    if (item._id === currentUser?.id || !window.confirm(`Delete ${item.fullName}'s account?`)) return;
    setBusyId(item._id);
    try {
      await axiosInstance.delete(`/admin/users/${item._id}`);
      setUsers((current) => current.filter((user) => user._id !== item._id));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete user.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-700">System</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">Users</h1>
          <p className="mt-1 text-sm text-ink-500">Manage registered users and their platform access.</p>
        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email" className="w-full rounded-lg border border-ink-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/15" />
          </div>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 outline-none focus:border-accent-600">
            <option value="ALL">All roles</option>
            <option value="USER">Users</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>

        {error && <div className="mb-5 rounded-lg border border-status-fail/20 bg-status-fail-bg px-4 py-3 text-sm text-status-fail">{error}</div>}
        {loading ? <Loader label="Loading users..." /> : filteredUsers.length === 0 ? <EmptyState title="No users found" message="Try changing your search or role filter." /> : (
          <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[1.5fr_1.5fr_0.8fr_1fr] gap-4 border-b border-ink-100 bg-ink-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 md:grid">
              <span>Name</span><span>Email</span><span>Role</span><span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-ink-100">
              {filteredUsers.map((item) => (
                <div key={item._id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.5fr_1.5fr_0.8fr_1fr] md:items-center md:gap-4">
                  <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-50 text-accent-700"><UserRound className="h-4 w-4" /></span><span className="text-sm font-semibold text-ink-900">{item.fullName}</span></div>
                  <span className="truncate text-sm text-ink-500">{item.email}</span>
                  <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${item.role === 'ADMIN' ? 'bg-accent-100 text-accent-800' : 'bg-ink-100 text-ink-600'}`}>{item.role === 'ADMIN' ? 'Admin' : 'User'}</span>
                  <div className="flex items-center justify-start gap-2 md:justify-end">
                    <Button variant="secondary" size="sm" disabled={busyId === item._id || item._id === currentUser?.id} onClick={() => updateRole(item)}><ShieldCheck className="h-3.5 w-3.5" />{item.role === 'ADMIN' ? 'Make user' : 'Make admin'}</Button>
                    <button type="button" disabled={busyId === item._id || item._id === currentUser?.id} onClick={() => removeUser(item)} className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-status-fail-bg hover:text-status-fail disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Delete ${item.fullName}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminUsers;