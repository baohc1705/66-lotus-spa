import { Pencil, ExternalLink, FileText } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { CertificateStatusBadge, ExpiryBadge } from './CertificateStatusBadge'
import type { StaffCertificateDTO } from '../types/certificate.types'

interface Props {
  cert: StaffCertificateDTO
  onEdit: () => void
}

function formatDate(value?: string) {
  if (!value) return '—'
  return value.slice(0, 10)
}

export function StaffCertificateDetailExpanded({ cert, onEdit }: Props) {
  return (
    <div className="p-4 bg-lotus-leaf-light/20">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Ảnh scan chứng chỉ */}
        <div className="w-full lg:w-[220px] shrink-0">
          {cert.documentUrl ? (
            <a
              href={cert.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg overflow-hidden border border-stone-200 hover:border-lotus-leaf/60 transition-all group/img"
            >
              <img
                src={cert.documentUrl}
                alt={cert.certificateName ?? 'Chứng chỉ'}
                className="h-[150px] w-full object-cover group-hover/img:scale-[1.02] transition-transform"
              />
            </a>
          ) : (
            <div className="h-[150px] w-full rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 flex flex-col items-center justify-center gap-1.5 text-stone-400">
              <FileText className="h-6 w-6" />
              <span className="text-[11px] font-medium">Chưa có ảnh scan</span>
            </div>
          )}
          {cert.documentUrl && (
            <a
              href={cert.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-lotus-leaf hover:underline"
            >
              <ExternalLink className="h-3 w-3" />Xem ảnh gốc
            </a>
          )}
        </div>

        {/* Thông tin chi tiết */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-[15px] font-semibold text-lotus-deep">{cert.certificateName}</h3>
              <p className="text-[12px] text-lotus-stone mt-0.5">{cert.typeName}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit} className="text-[12px] gap-1.5 shrink-0">
              <Pencil className="w-3.5 h-3.5" />Chỉnh sửa
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            <DetailField label="Nhân viên" value={cert.staffName} />
            <DetailField label="Số chứng chỉ" value={cert.certificateNumber} />
            <DetailField label="Tổ chức cấp" value={cert.issuingOrganization} />
            <DetailField label="Ngày cấp" value={formatDate(cert.issuedDate)} />
            <DetailField label="Ngày hết hạn" value={formatDate(cert.expiryDate)} />
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-lotus-stone uppercase tracking-wide">Trạng thái</p>
              <div className="flex flex-wrap items-center gap-2">
                <CertificateStatusBadge status={cert.status} />
                <ExpiryBadge expiryDate={cert.expiryDate ?? undefined} />
              </div>
            </div>
          </div>

          {cert.note && (
            <div className="mt-3 space-y-1">
              <p className="text-[11px] font-semibold text-lotus-stone uppercase tracking-wide">Ghi chú</p>
              <p className="text-[13px] text-lotus-deep/80 whitespace-pre-line">{cert.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-lotus-stone uppercase tracking-wide">{label}</p>
      <p className="text-[13px] text-lotus-deep font-medium">{value || '—'}</p>
    </div>
  )
}
