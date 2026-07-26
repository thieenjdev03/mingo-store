'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Dialog } from '@/components/admin/ui/dialog';
import { Field } from '@/components/admin/ui/field';
import { Input } from '@/components/admin/ui/input';
import { Textarea } from '@/components/admin/ui/textarea';
import { NativeSelect } from '@/components/admin/ui/native-select';
import { Switch } from '@/components/admin/ui/switch';
import { Button } from '@/components/admin/ui/button';
import { MultiSelect } from '@/components/admin/ui/multi-select';
import { useToast } from '@/components/admin/ui/toast';
import { provinces, getWardsByProvince } from '@/lib/vn-address';
import { getCategoryOptions, getCollectionOptions } from '@/features/admin/shared/options';
import { createDistributor, updateDistributor } from './api';
import type { DistributorDto } from '@/lib/api/generated/ecomAPI.schemas';

interface DistributorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distributor: DistributorDto | null;
  onSaved: () => void;
}

export function DistributorForm({ open, onOpenChange, distributor, onSaved }: DistributorFormProps) {
  const { toast } = useToast();
  const { data: categoryOptions = [] } = useSWR('admin-category-options', getCategoryOptions);
  const { data: collectionOptions = [] } = useSWR('admin-collection-options', getCollectionOptions);

  const [name, setName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [districtText, setDistrictText] = useState('');
  const [description, setDescription] = useState('');
  const [mapsEmbed, setMapsEmbed] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const wards = provinceCode ? getWardsByProvince(provinceCode) : [];

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName(distributor?.name ?? '');
    setAddressLine(distributor?.address_line ?? '');
    setProvinceCode(distributor?.province_code ?? '');
    setWardCode(distributor?.ward_code ?? '');
    setDistrictText(distributor?.district_text ?? '');
    setDescription(distributor?.description ?? '');
    setMapsEmbed(distributor?.maps_embed_src ?? '');
    setIsActive(distributor?.is_active ?? true);
    setCategoryIds(distributor?.categories?.map((c) => c.id) ?? []);
    setCollectionIds(distributor?.collections?.map((c) => c.id) ?? []);
  }, [open, distributor]);

  const onSubmit = async () => {
    const province = provinces.find((p) => p.id === provinceCode);
    const ward = wards.find((w) => w.id === wardCode);
    if (!name.trim() || !addressLine.trim() || !province || !ward || !mapsEmbed.trim()) {
      setError('Vui lòng nhập đủ: tên, địa chỉ, tỉnh/thành, phường/xã, và mã nhúng bản đồ.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        address_line: addressLine.trim(),
        district_text: districtText.trim() || null,
        ward_code: ward.id,
        ward_name: ward.name,
        province_code: province.id,
        province_name: province.name,
        description: description.trim() || null,
        maps_embed: mapsEmbed.trim(),
        is_active: isActive,
        category_ids: categoryIds,
        collection_ids: collectionIds,
      };
      if (distributor) {
        await updateDistributor(distributor.id, payload);
        toast({ title: 'Đã cập nhật nhà phân phối', tone: 'success' });
      } else {
        await createDistributor(payload);
        toast({ title: 'Đã tạo nhà phân phối', tone: 'success' });
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
      title={distributor ? 'Sửa nhà phân phối' : 'Thêm nhà phân phối'}
      className="max-w-2xl"
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
        <Field id="name" label="Tên">
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field id="address" label="Địa chỉ">
          <Input id="address" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="province" label="Tỉnh / Thành">
            <NativeSelect
              id="province"
              value={provinceCode}
              onChange={(e) => {
                setProvinceCode(e.target.value);
                setWardCode('');
              }}
            >
              <option value="">— Chọn —</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field id="ward" label="Phường / Xã">
            <NativeSelect id="ward" value={wardCode} onChange={(e) => setWardCode(e.target.value)} disabled={!provinceCode}>
              <option value="">— Chọn —</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <Field id="district" label="Khu vực (tuỳ chọn)" required={false}>
          <Input id="district" value={districtText} onChange={(e) => setDistrictText(e.target.value)} />
        </Field>
        <Field id="desc" label="Mô tả" required={false}>
          <Textarea id="desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field id="maps" label="Mã nhúng Google Maps" hint="Dán thẻ <iframe> hoặc URL embed từ Google Maps." error={error ?? undefined}>
          <Textarea id="maps" rows={2} value={mapsEmbed} onChange={(e) => setMapsEmbed(e.target.value)} className="font-mono text-xs" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="categories" label="Danh mục" required={false}>
            <MultiSelect options={categoryOptions} value={categoryIds} onChange={setCategoryIds} />
          </Field>
          <Field id="collections" label="Bộ sưu tập" required={false}>
            <MultiSelect options={collectionOptions} value={collectionIds} onChange={setCollectionIds} />
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
          <label htmlFor="active" className="text-sm font-semibold text-foreground">
            Đang hoạt động
          </label>
        </div>
      </div>
    </Dialog>
  );
}
