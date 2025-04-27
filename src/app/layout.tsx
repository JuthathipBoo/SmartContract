import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "PayrollHub",
  description: "Your payroll dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={notoSansThai.className}>{children}</body>
    </html>
  );
}
