'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Calendar, Users, Plus,
  ArrowRight, BookOpen, Shield, ClipboardList,
  Mic2, MapPin, Activity,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace('/login?next=/admin')
    }
  }, [user, isAdmin, loading, router])

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const QUICK_LINKS = [
    {
      href: '/admin/eventos/novo',
      icon: Plus,
      label: 'Criar Evento',
      description: 'Adicione um novo evento acadêmico',
      color: 'bg-emerald-500',
    },
    {
      href: '/admin/eventos',
      icon: Calendar,
      label: 'Gerenciar Eventos',
      description: 'Edite, publique ou remova eventos',
      color: 'bg-primary',
    },
    {
      href: '/admin/inscricoes',
      icon: ClipboardList,
      label: 'Inscrições',
      description: 'Consulte inscrições com filtros e paginação',
      color: 'bg-amber-500',
    },
    {
      href: '/admin/atividades',
      icon: Activity,
      label: 'Atividades',
      description: 'Palestras, oficinas e minicursos',
      color: 'bg-sky-500',
    },
    {
      href: '/admin/palestrantes',
      icon: Mic2,
      label: 'Palestrantes',
      description: 'Cadastro de palestrantes',
      color: 'bg-rose-500',
    },
    {
      href: '/admin/locais',
      icon: MapPin,
      label: 'Locais',
      description: 'Salas, auditórios e laboratórios',
      color: 'bg-orange-500',
    },
    {
      href: '/admin/usuarios',
      icon: Users,
      label: 'Usuários',
      description: 'Gerencie contas e permissões',
      color: 'bg-violet-500',
    },
  ]

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="bg-primary pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm font-medium text-accent uppercase tracking-wider">Painel Admin</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Bem-vindo, {user.nome.split(' ')[0]}</h1>
          <p className="text-primary-foreground/70 mt-1">
            Gerencie eventos, usuários e configurações da plataforma Eventus.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Quick links */}
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          Ações rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
          {QUICK_LINKS.map(({ href, icon: Icon, label, description, color }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-primary" />
              Sobre o painel
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                Crie e publique eventos com data, horário, local e palestrantes
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                Acompanhe inscrições e ocupação de cada atividade
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                Gerencie permissões de professores e estudantes
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary" />
              Sua sessão
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24">Nome</span>
                <span className="text-foreground font-medium">{user.nome}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24">E-mail</span>
                <span className="text-foreground font-medium">{user.email}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-24">Função</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
