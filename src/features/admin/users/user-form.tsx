'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/admin/ui/dialog';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Button } from '@/components/admin/ui/button';
import { useToast } from '@/components/admin/ui/toast';
import type { UserResponseDto, CreateUserDtoRole } from '@/lib/api/generated/ecomAPI.schemas';
import { createUser, updateUser } from './api';

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto | null;
  onSaved: () => void;
}

export function UserForm({ open, onOpenChange, user, onSaved }: UserFormProps) {
  const { toast } = useToast();
  const isEdit = !!user;
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<CreateUserDtoRole>('user');
  const [profile, setProfile] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setEmail(user?.email ?? '');
    setPhoneNumber(user?.phoneNumber ?? '');
    setPassword('');
    setRole((user?.role as CreateUserDtoRole) ?? 'user');
    setProfile(user?.profile ?? '');
  }, [open, user]);

  const onSubmit = async () => {
    if (!isEdit) {
      if (!phoneNumber.trim() || password.length < 6) {
        setError('Cần số điện thoại và mật khẩu tối thiểu 6 ký tự.');
        return;
      }
    } else if (password && password.length < 6) {
      setError('Mật khẩu mới tối thiểu 6 ký tự.');
      return;
    }
    setSaving(true);
    try {
      if (isEdit && user) {
        await updateUser(user.id, {
          email: email.trim() || undefined,
          password: password || undefined,
          role,
          profile: profile.trim() || undefined,
        });
        toast({ title: 'Đã cập nhật người dùng', tone: 'success' });
      } else {
        await createUser({ phoneNumber: phoneNumber.trim(), password, role, profile: profile.trim() || undefined });
        toast({ title: 'Đã tạo người dùng', tone: 'success' });
      }
      onOpenChange(false);
      onSaved();
    } catch {
      toast({ title: 'Lưu thất bại', tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Sửa người dùng' : 'Thêm người dùng'}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Huỷ
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {isEdit ? (
          <Field id="email" label="Email" required={false}>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        ) : (
          <Field id="phone" label="Số điện thoại">
            <Input id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </Field>
        )}
        <Field
          id="password"
          label={isEdit ? 'Mật khẩu mới' : 'Mật khẩu'}
          required={!isEdit}
          hint={isEdit ? 'Bỏ trống nếu không đổi.' : 'Tối thiểu 6 ký tự.'}
        >
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </Field>
        <Field id="role" label="Vai trò" required={false}>
          <NativeSelect id="role" value={role} onChange={(e) => setRole(e.target.value as CreateUserDtoRole)}>
            <option value="user">Khách hàng</option>
            <option value="admin">Quản trị</option>
          </NativeSelect>
        </Field>
        <Field id="profile" label="Ghi chú hồ sơ" required={false} error={error ?? undefined}>
          <Input id="profile" value={profile} onChange={(e) => setProfile(e.target.value)} />
        </Field>
      </div>
    </Dialog>
  );
}
