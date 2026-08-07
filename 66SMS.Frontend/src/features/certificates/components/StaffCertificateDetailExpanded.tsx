import { Pencil, ExternalLink, FileText } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { CertificateStatusBadge, ExpiryBadge } from './CertificateStatusBadge'
import { formatDisplayDate } from '@/shared/utils/date.utils'
import { PermissionGate } from '@/shared/components/security/PermissionGate'
import { CERTIFICATE_PERM } from '../constants/certificate.permissions'
import type { StaffCertificateDTO } from '../types/certificate.types'

interface Props {
  cert: StaffCertificateDTO
  onEdit: () => void
}

export function StaffCertificateDetailExpanded({ cert, onEdit }: Props) {
  const perm = CERTIFICATE_PERM;

  return (
    <div className="p-4 bg-adminGreen-50/20">
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="w-full lg:w-[220px] shrink-0">
          {cert.documentUrl ? (
            <a
              href={cert.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg overflow-hidden border border-adminGray-100 hover:border-adminGreen-600/60 transition-all group/img"
            >
              <img
                src={cert.documentUrl}
                alt={cert.certificateName ?? 'Chứng chỉ'}
                className="h-[150px] w-full object-cover group-hover/img:scale-[1.02] transition-transform"
              />
            </a>
          ) : (
            <div className="h-[150px] w-full rounded-lg border-2 border-dashed border-adminGray-300 bg-adminGray-50 flex flex-col items-center justify-center gap-1.5 text-adminGray-400">
              <FileText className="h-6 w-6" />
              <span className="text-xs font-medium">Chưa có ảnh scan</span>
            </div>
          )}
          {cert.documentUrl && (
            <a
              href={cert.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-adminGreen-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />Xem ảnh gốc
            </a>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-adminInk">{cert.certificateName}</h3>
              <p className="text-xs text-adminGray-600 mt-0.5">{cert.typeName}</p>
            </div>
            <PermissionGate resource={perm.resource} action={perm.update}>
              <Button variant="outline" size="sm" onClick={onEdit} className="text-xs gap-1.5 shrink-0">
                <Pencil className="w-3.5 h-3.5" />Chỉnh sửa
              </Button>
            </PermissionGate>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            <DetailField label="Nhân viên" value={cert.staffName} />
            <DetailField label="Số chứng chỉ" value={cert.certificateNumber} />
            <DetailField label="Tổ chức cấp" value={cert.issuingOrganization} />
            <DetailField label="Ngày cấp" value={formatDisplayDate(cert.issuedDate)} />
            <DetailField label="Ngày hết hạn" value={formatDisplayDate(cert.expiryDate)} />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-adminGray-600 uppercase tracking-wide">Trạng thái</p>
              <div className="flex flex-wrap items-center gap-2">
                <CertificateStatusBadge status={cert.status} />
                <ExpiryBadge expiryDate={cert.expiryDate ?? undefined} />
              </div>
            </div>
          </div>

          {cert.note && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-semibold text-adminGray-600 uppercase tracking-wide">Ghi chú</p>
              <p className="text-sm text-adminInk/80 whitespace-pre-line">{cert.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface DetailFieldProps {
  label: string;
  value?: string | null;
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-adminGray-600 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-adminInk font-medium">{value || '—'}</p>
    </div>
  )
}
