import {
  CheckCircle2,
  Pencil,
  ExternalLink,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { PermissionGate } from "@/shared/components/security/PermissionGate";
import { Button } from "@/shared/elements/Button";
import {
  TableDetailActions,
  TableDetailExpanded,
  TableDetailField,
  TableDetailGrid,
  TableDetailHeader,
} from "@/shared/tables/TableDetailExpanded";
import { formatDisplayDate } from "@/shared/utils/date.utils";
import { CERTIFICATE_PERM } from "@/features/certificates/constants/certificate.permissions";
import type { StaffCertificateDto } from "@/features/certificates/types/certificate.types";
import {
  CertificateStatusBadge,
  ExpiryBadge,
} from "@/features/certificates/components/CertificateStatusBadge";

interface Props {
  cert: StaffCertificateDto;
  onEdit: () => void;
  onApprove?: (cert: StaffCertificateDto) => void;
  isApproving?: boolean;
  submitMode?: boolean;
}

export function StaffCertificateDetailExpanded({
  cert,
  onEdit,
  onApprove,
  isApproving = false,
  submitMode = false,
}: Props) {
  const perm = CERTIFICATE_PERM;
  const canApprove = !submitMode && cert.status === 0 && !!onApprove;

  const previewIcon = cert.documentUrl ? (
    <img
      src={cert.documentUrl}
      alt={cert.certificateName}
      className="h-full w-full object-cover"
    />
  ) : (
    <FileText className="h-5 w-5 text-kit-muted" />
  );

  return (
    <TableDetailExpanded>
      <TableDetailHeader
        icon={previewIcon}
        title={cert.certificateName}
        subtitle={cert.typeName}
      />

      <TableDetailGrid cols={3}>
        <TableDetailField label="Nhân viên" value={cert.staffName} />
        <TableDetailField label="Số chứng chỉ" value={cert.certificateNumber} />
        <TableDetailField
          label="Tổ chức cấp"
          value={cert.issuingOrganization}
        />
        <TableDetailField
          label="Ngày cấp"
          value={formatDisplayDate(cert.issuedDate)}
        />
        <TableDetailField
          label="Ngày hết hạn"
          value={
            <span className="flex flex-wrap items-center gap-2">
              <ExpiryBadge expiryDate={cert.expiryDate} />
            </span>
          }
        />
        <TableDetailField
          label="Trạng thái"
          value={<CertificateStatusBadge status={cert.status} />}
        />
      </TableDetailGrid>

      {cert.note ? (
        <TableDetailField label="Ghi chú" value={cert.note} />
      ) : null}

      <TableDetailActions>
        {cert.documentUrl ? (
          <a
            href={cert.documentUrl}
            target="_blank"
            rel="noreferrer"
            className="mb-0 inline-flex items-center gap-1.5 text-xs font-medium text-kit-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Xem ảnh gốc
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-kit-muted">
            <ShieldCheck className="h-3.5 w-3.5" />
            Chưa có ảnh scan
          </span>
        )}
        {canApprove ? (
          <PermissionGate resource={perm.resource} action={perm.update}>
            <Button
              variant="admin"
              size="sm"
              className="mb-0"
              loading={isApproving}
              onClick={() => onApprove(cert)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Duyệt chứng chỉ
            </Button>
          </PermissionGate>
        ) : null}
        {!submitMode ? (
          <PermissionGate resource={perm.resource} action={perm.update}>
            <Button variant="admin" size="sm" className="mb-0" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Chỉnh sửa
            </Button>
          </PermissionGate>
        ) : null}
      </TableDetailActions>
    </TableDetailExpanded>
  );
}
