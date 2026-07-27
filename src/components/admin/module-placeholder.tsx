import { Construction } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui/page-header';

interface ModulePlaceholderProps {
  title: string;
  note?: string;
}

/** Trang tạm cho module admin chưa dựng — để sidebar điều hướng đầy đủ, không 404. */
export function ModulePlaceholder({ title, note }: ModulePlaceholderProps) {
  return (
    <div>
      <PageHeader title={title} />
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-white py-20 text-center">
        <Construction className="size-10 text-muted-foreground" />
        <p className="text-sm font-semibold text-foreground">Module đang được xây dựng</p>
        {note ? <p className="max-w-md text-sm text-muted-foreground">{note}</p> : null}
      </div>
    </div>
  );
}
