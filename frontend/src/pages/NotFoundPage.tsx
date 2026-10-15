import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <h1 className="text-5xl font-bold text-slate-300">404</h1>
      <p className="text-slate-600">Không tìm thấy trang.</p>
      <Link to="/" className="text-blue-600 hover:underline">
        Về trang chủ
      </Link>
    </div>
  );
}
