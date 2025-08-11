interface MainLayoutProps {
  children: React.ReactNode;
  logoSrc?: string; // Make optional since we're not using it anymore
  onLoginClick?: () => void; // Make optional
  onSignupClick?: () => void; // Make optional
  addPadding?: boolean; // Make optional
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  addPadding = true,
}) => {
  return (
    <main className={`flex-1 ${addPadding ? "p-4" : ""}`}>
      {children}
    </main>
  );
};

export default MainLayout;