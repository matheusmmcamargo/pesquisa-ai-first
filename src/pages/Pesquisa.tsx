import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { AssessmentForm } from '../components/AssessmentForm'

export const Pesquisa: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Home</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Ambiente Seguro • LGPD</span>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full">
          <AssessmentForm />
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="mt-8 text-center text-xs text-gray-400 font-mono">
        <p>© {new Date().getFullYear()} Agência Camargo • Growth Engineering & AI Infrastructure</p>
      </footer>
    </div>
  )
}

export default Pesquisa
