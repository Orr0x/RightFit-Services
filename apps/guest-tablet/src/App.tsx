import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/ui/Toast'
import GuestWelcome from './pages/GuestWelcome'
import AIChat from './pages/AIChat'
import ReportIssue from './pages/ReportIssue'
import DIYGuide from './pages/DIYGuide'
import KnowledgeBase from './pages/KnowledgeBase'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider position="top-right">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GuestWelcome />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/report-issue" element={<ReportIssue />} />
            <Route path="/diy-guides" element={<DIYGuide />} />
            <Route path="/info" element={<KnowledgeBase />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
