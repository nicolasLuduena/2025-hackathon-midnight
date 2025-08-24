import { Button } from "@/components/ui/button";
import { WalletProvider } from "@/hooks/useWallet";
import Header from "./components/Header";
function App() {
  return (
    <div>
      <WalletProvider>
        <Header />
        <Button>Hola</Button>
        <h1 className="text-3xl font-bold underline text-red-500">
          Hello world!
        </h1>
      </WalletProvider>
    </div>
  );
}

export default App;
