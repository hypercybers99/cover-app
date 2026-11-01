import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { WalletProvider } from './context/WalletContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { ProductsPage } from './pages/ProductsPage';
import { CreateProductPage } from './pages/CreateProductPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { PolicyDetailPage } from './pages/PolicyDetailPage';
import { CreditsPage } from './pages/CreditsPage';
import { CoverGuardPage } from './pages/CoverGuardPage';
import { EvidencePage } from './pages/EvidencePage';
import { LimitsPage } from './pages/LimitsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <WalletProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <div className="min-h-screen flex flex-col bg-page text-ink selection:bg-sage selection:text-sage-text">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/new" element={<CreateProductPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/policies/:id" element={<PolicyDetailPage />} />
                <Route path="/credits" element={<CreditsPage />} />
                <Route path="/guard" element={<CoverGuardPage />} />
                <Route path="/evidence" element={<EvidencePage />} />
                <Route path="/limits" element={<LimitsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </WalletProvider>
    </ThemeProvider>
  );
};

export default App;
