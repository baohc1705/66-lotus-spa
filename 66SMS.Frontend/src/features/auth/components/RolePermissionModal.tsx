export function RolePermissionModal({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-lotus-deep/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-[420px] max-w-[95vw] shadow-jade-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-lotus-deep">{title}</h3>
          <button
            onClick={onClose}
            className="text-xl leading-none text-lotus-stone hover:text-lotus-deep bg-transparent border-0 cursor-pointer"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
