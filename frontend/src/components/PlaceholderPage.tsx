interface PlaceholderPageProps {
  title: string;
  owner: string;
  /** Các chức năng cần làm theo yêu cầu đồ án */
  features: string[];
}

/** Trang tạm: thay bằng giao diện thật khi làm chức năng. */
export default function PlaceholderPage({ title, owner, features }: PlaceholderPageProps) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">
        Phụ trách: <span className="font-semibold text-slate-700">{owner}</span> — trang đang chờ triển khai
      </p>
      <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-5">
        <p className="mb-2 text-sm font-semibold">Chức năng cần làm:</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          {features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
