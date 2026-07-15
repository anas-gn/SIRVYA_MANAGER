import "./globals.css";

export const metadata = {
  title: "SIRVYA Manager",
  description: "Espace manager SIRVYA - gestion des advisors, coaches et reservations",
  icon: "/icon_app.png",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href={metadata.icon} />
      </head>
      <body>{children}</body>
    </html>
  );
}
