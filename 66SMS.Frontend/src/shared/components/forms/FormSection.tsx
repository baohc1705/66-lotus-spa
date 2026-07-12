export function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-adminGray-100">
        <Icon className="w-4 h-4 text-adminGold-600" />
        <h3 className="lotus-admin-form-section-title">{title}</h3>
      </div>
      {children}
    </div>
  );
}
