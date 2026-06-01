import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout'
import { KnowledgeSourcesPage } from './pages/KnowledgeSourcesPage'
import { QAPairsPage } from './pages/QAPairsPage'
import { ChatPage } from './pages/ChatPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/sources" element={<KnowledgeSourcesPage />} />
        <Route path="/qa" element={<QAPairsPage />} />
      </Route>
      <Route path="/chat" element={<ChatPage />} />
      <Route path="*" element={<Navigate to="/sources" replace />} />
    </Routes>
  )
}
