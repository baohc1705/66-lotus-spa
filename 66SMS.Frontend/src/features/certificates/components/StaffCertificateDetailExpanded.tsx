import { Pencil, ExternalLink, FileText, ShieldCheck } from "lucide-react";
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
import { CERTIFICATE_PERM } from "../constants/certificate.permissions";
import type { StaffCertificateDTO } from "../types/certificate.types";
import { CertificateStatusBadge, ExpiryBadge } from "./CertificateStatusBadge";

interface Props {
  cert: StaffCertificateDTO;
  onEdit: () => void;
}

export function StaffCertificateDetailExpanded({ cert, onEdit }: Props) {
  const perm = CERTIFICATE_PERM;

  const previewIcon = cert.documentUrl ? (
    <img
      src={cert.documentUrl}
      alt={cert.certificateName ?? "Chứng chỉ"}
      className="h-full w-full object-cover"
    />
  ) : (
    <FileText className="h-5 w-5 text-kit-muted" />
  );

  return (
    <TableDetailExpanded>
      <TableDetailHeader
        icon={previewIcon}
        title={cert.certificateName ?? "—"}
        subtitle={cert.typeName ?? undefined}
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
              <ExpiryBadge expiryDate={cert.expiryDate ?? undefined} />
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
        <PermissionGate resource={perm.resource} action={perm.update}>
          <Button
            variant="admin"
            size="sm"
            className="mb-0"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
            Chỉnh sửa
          </Button>
        </PermissionGate>
      </TableDetailActions>
    </TableDetailExpanded>
  );
}
