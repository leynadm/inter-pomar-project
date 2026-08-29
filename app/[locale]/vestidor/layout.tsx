import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "El Vestidor — Inter Pomar",
  robots: "noindex, nofollow",
};

export default async function VestidorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check auth cookie
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("vestidor-auth");
  const isAuthed = authCookie?.value === process.env.VESTIDOR_PASSWORD;

  if (!isAuthed) {
    // Show login form instead of the tool
    return (
      <html lang="ca">
        <body className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="w-full max-w-sm rounded-lg border bg-white p-8 shadow-sm">
            <h1 className="mb-1 text-center text-xl font-bold text-gray-900">
              El Vestidor
            </h1>
            <p className="mb-6 text-center text-sm text-gray-500">
              Inter Pomar · Zona privada
            </p>
            <form action="/api/vestidor-auth" method="POST">
              <input
                type="password"
                name="password"
                placeholder="Contrasenya"
                required
                className="mb-3 w-full rounded-md border px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                autoFocus
              />
              <button
                type="submit"
                className="w-full rounded-md bg-[#1B6B33] px-4 py-2 text-sm font-medium text-white hover:bg-[#14522A]"
              >
                Entrar
              </button>
            </form>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="ca">
      <body>{children}</body>
    </html>
  );
}
