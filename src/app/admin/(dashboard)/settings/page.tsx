'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui/page-header';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Field } from '@/components/admin/ui/field';
import { useToast } from '@/components/admin/ui/toast';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { getSiteSettings, siteSettingsKey, updateSiteSettings } from '@/features/admin/settings/api';

/** Chỉ lưu link, không upload file — khách gửi link nào thì dán link đó vào đây. */
const LINKS = [
  {
    key: 'partnership_pdf_url',
    label: 'Link PDF hồ sơ hợp tác',
    hint: 'Nút "Liên hệ đội ngũ" ở trang Hợp tác sẽ mở link này. Để trống thì nút quay về trang /contact.',
    placeholder: 'https://drive.google.com/…/ho-so-hop-tac.pdf',
  },
] as const;

type LinkKey = (typeof LINKS)[number]['key'];
type FormValues = Record<LinkKey, string>;

const EMPTY_FORM: FormValues = { partnership_pdf_url: '' };

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { data, isLoading, error, mutate } = useSWR(siteSettingsKey, getSiteSettings);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Nạp giá trị từ server một lần mỗi khi fetch lại, không đè lên chữ admin đang gõ.
  useEffect(() => {
    if (!data) return;
    setValues({ partnership_pdf_url: data.partnership_pdf_url ?? '' });
  }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      const saved = await updateSiteSettings({ partnership_pdf_url: values.partnership_pdf_url.trim() });
      await mutate(saved, { revalidate: false });
      toast({ title: 'Đã lưu liên kết', tone: 'success' });
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Lưu thất bại'), tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Liên kết hợp tác"
        description="Các đường dẫn ngoài do khách hàng cung cấp. Chỉ lưu link, không upload file."
      />

      {error ? (
        <p className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive" role="alert">
          Không tải được cấu hình liên kết.
        </p>
      ) : null}

      <div className="max-w-2xl rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5">
          {LINKS.map((link) => {
            const value = values[link.key];
            return (
              <Field key={link.key} id={link.key} label={link.label} hint={link.hint}>
                <div className="flex gap-2">
                  <Input
                    id={link.key}
                    type="url"
                    inputMode="url"
                    placeholder={link.placeholder}
                    value={value}
                    disabled={isLoading}
                    onChange={(e) => setValues((current) => ({ ...current, [link.key]: e.target.value }))}
                  />
                  {value.startsWith('http') ? (
                    <Button variant="ghost" size="icon" asChild aria-label="Mở link">
                      <a href={value} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </Field>
            );
          })}

          <div>
            <Button onClick={save} disabled={saving || isLoading}>
              {saving ? 'Đang lưu…' : 'Lưu'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
