'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { UserResponseDto, UsersControllerFindAllRole } from '@/lib/api/generated/ecomAPI.schemas';
import { PageHeader } from '@/components/admin/ui/page-header';
import { DataTable, type Column } from '@/components/admin/ui/data-table';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Badge } from '@/components/admin/ui/badge';
import { Pagination } from '@/components/admin/ui/pagination';
import { ConfirmDialog } from '@/components/admin/ui/confirm-dialog';
import { useToast } from '@/components/admin/ui/toast';
import { UserForm } from '@/features/admin/users/user-form';
import { usersKey, listUsers, deleteUser } from '@/features/admin/users/api';

const LIMIT = 10;

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'' | UsersControllerFindAllRole>('');
  const [page, setPage] = useState(1);

  const params = { email: email.trim() || undefined, role: role || undefined, page, limit: LIMIT };
  const { data, isLoading, error, mutate } = useSWR(usersKey(params), () => listUsers(params));
  const rows = data?.data ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserResponseDto | null>(null);
  const [deleting, setDeleting] = useState<UserResponseDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleting.id);
      toast({ title: 'Đã xoá người dùng', tone: 'success' });
      setDeleting(null);
      mutate();
    } catch {
      toast({ title: 'Xoá thất bại', tone: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<UserResponseDto>[] = [
    { key: 'email', header: 'Email', render: (u) => <span className="font-semibold">{u.email || '—'}</span> },
    { key: 'phoneNumber', header: 'Điện thoại', render: (u) => u.phoneNumber || <span className="text-muted-foreground">—</span> },
    {
      key: 'role',
      header: 'Vai trò',
      align: 'center',
      render: (u) => <Badge tone={u.role === 'admin' ? 'info' : 'neutral'}>{u.role === 'admin' ? 'Quản trị' : 'Khách hàng'}</Badge>,
    },
    { key: 'createdAt', header: 'Ngày tạo', render: (u) => new Date(u.createdAt).toLocaleDateString('vi-VN') },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Sửa" onClick={() => { setEditing(u); setFormOpen(true); }}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Xoá" onClick={() => setDeleting(u)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Người dùng"
        description="Quản lý tài khoản khách hàng & quản trị."
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="size-4" /> Thêm người dùng
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Tìm theo email…" value={email} onChange={(e) => { setEmail(e.target.value); setPage(1); }} className="max-w-xs" />
        <NativeSelect value={role} onChange={(e) => { setRole(e.target.value as typeof role); setPage(1); }} className="max-w-[180px]">
          <option value="">Tất cả vai trò</option>
          <option value="user">Khách hàng</option>
          <option value="admin">Quản trị</option>
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(u) => u.id}
        loading={isLoading}
        error={error ? 'Không tải được danh sách người dùng.' : null}
        emptyMessage="Chưa có người dùng nào."
      />
      <Pagination page={page} totalPages={totalPages} total={data?.total} onPageChange={setPage} />

      <UserForm open={formOpen} onOpenChange={setFormOpen} user={editing} onSaved={() => mutate()} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xoá người dùng?"
        description={deleting ? `"${deleting.email || deleting.phoneNumber}" sẽ bị xoá.` : undefined}
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
