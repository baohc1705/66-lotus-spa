import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Mail } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Button } from "@/shared/elements/Button";
import { FormField } from "@/shared/forms/FormField";
import { Input } from "@/shared/forms/Input";
import { useSendCustomerEmail } from "../hooks/useSendCustomerEmail";

type CustomerSendEmailFormProps = {
  customerId: number;
  customerName?: string | null;
  customerEmail?: string | null;
};

function buildDefaultBody(customerName?: string | null): string {
  const name = customerName?.trim() || "";
  if (name) {
    return `<p>Xin chào ${name},</p><p>Cảm ơn bạn đã sử dụng dịch vụ.</p>`;
  }
  return "<p>Xin chào,</p><p>Cảm ơn bạn đã sử dụng dịch vụ.</p>";
}

export function CustomerSendEmailForm({
  customerId,
  customerName,
  customerEmail,
}: CustomerSendEmailFormProps) {
  const [email, setEmail] = useState(customerEmail ?? "");
  const [subject, setSubject] = useState("Thông báo từ Hoa Sen Spa");
  const [htmlBody, setHtmlBody] = useState(buildDefaultBody(customerName));

  const { mutate, isPending } = useSendCustomerEmail();

  useEffect(() => {
    setEmail(customerEmail ?? "");
    setSubject("Thông báo từ Hoa Sen Spa");
    setHtmlBody(buildDefaultBody(customerName));
  }, [customerId, customerEmail, customerName]);

  const handleSubmit = () => {
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const sanitizedBody = DOMPurify.sanitize(htmlBody);

    if (!trimmedEmail || !trimmedSubject || !sanitizedBody) {
      return;
    }

    mutate({
      toEmail: trimmedEmail,
      subject: trimmedSubject,
      htmlBody: sanitizedBody,
    });
  };

  const canSubmit =
    email.trim().length > 0 &&
    subject.trim().length > 0 &&
    htmlBody.trim().length > 0 &&
    !isPending;

  return (
    <div className="space-y-4">
      <FormField label="Email người nhận" required>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="customer@gmail.com"
        />
      </FormField>

      <FormField label="Tiêu đề" required>
        <Input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Tiêu đề email"
        />
      </FormField>

      <FormField label="Nội dung" required>
        <div className="rounded border border-kit bg-kit-white [&_.ql-toolbar]:rounded-t [&_.ql-container]:min-h-[180px] [&_.ql-container]:rounded-b">
          <ReactQuill theme="snow" value={htmlBody} onChange={setHtmlBody} />
        </div>
      </FormField>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="mb-0"
          onClick={handleSubmit}
          disabled={!canSubmit}
          loading={isPending}
        >
          <Mail className="mr-1.5 h-4 w-4" />
          Gửi email
        </Button>
      </div>
    </div>
  );
}
