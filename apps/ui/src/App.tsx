import { WalletProvider } from "@/hooks/useWallet";
import Header from "./components/Header";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <WalletProvider>
        <Header />
        <main className="pt-16 px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Welcome to Midnight DApp</h1>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to get started with the application.
            </p>
          </div>
        </main>
      </WalletProvider>
    </div>
  );
}

export default App;
