import React, { useState, useEffect } from 'react'
import { DollarSign, Clock, FileText, Download, CreditCard, Calendar, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

interface Invoice {
  id: string
  number: string
  date: string
  dueDate: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  description: string
  items: InvoiceItem[]
}

interface InvoiceItem {
  id: string
  description: string
  hours?: number
  rate?: number
  amount: number
  date: string
}

interface TimeEntry {
  id: string
  date: string
  description: string
  hours: number
  rate: number
  billable: boolean
  caseId: string
  caseName: string
}

const BillingView: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - in production, fetch from your database
  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        number: 'INV-2024-001',
        date: '2024-01-15',
        dueDate: '2024-02-15',
        amount: 2500.00,
        status: 'paid',
        description: 'Legal services for Contract Review - ABC Corp',
        items: [
          {
            id: '1',
            description: 'Contract review and analysis',
            hours: 8,
            rate: 250,
            amount: 2000,
            date: '2024-01-10'
          },
          {
            id: '2',
            description: 'Client consultation',
            hours: 2,
            rate: 250,
            amount: 500,
            date: '2024-01-12'
          }
        ]
      },
      {
        id: '2',
        number: 'INV-2024-002',
        date: '2024-01-20',
        dueDate: '2024-02-20',
        amount: 1800.00,
        status: 'pending',
        description: 'Employment dispute consultation',
        items: [
          {
            id: '3',
            description: 'Case research and preparation',
            hours: 6,
            rate: 250,
            amount: 1500,
            date: '2024-01-18'
          },
          {
            id: '4',
            description: 'Document preparation',
            hours: 1.2,
            rate: 250,
            amount: 300,
            date: '2024-01-19'
          }
        ]
      }
    ]

    const mockTimeEntries: TimeEntry[] = [
      {
        id: '1',
        date: '2024-01-25',
        description: 'Research case precedents',
        hours: 3.5,
        rate: 250,
        billable: true,
        caseId: '1',
        caseName: 'Contract Review - ABC Corp'
      },
      {
        id: '2',
        date: '2024-01-24',
        description: 'Client phone call',
        hours: 0.5,
        rate: 250,
        billable: true,
        caseId: '2',
        caseName: 'Employment Dispute'
      }
    ]

    setInvoices(mockInvoices)
    setTimeEntries(mockTimeEntries)
    setLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)
  const totalPending = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0)
  const unbilledHours = timeEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + entry.hours, 0)
  const unbilledAmount = timeEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + (entry.hours * entry.rate), 0)

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Billed</p>
              <p className="text-3xl font-bold text-gray-900">${totalBilled.toLocaleString()}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-3xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">${totalPending.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unbilled</p>
              <p className="text-3xl font-bold text-purple-600">${unbilledAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{unbilledHours} hours</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All
          </motion.button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Invoice</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 5).map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.number}</p>
                      <p className="text-sm text-gray-500">{invoice.description}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    ${invoice.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Download className="h-4 w-4" />
                      </motion.button>
                      {invoice.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-green-600 hover:text-green-800"
                        >
                          <CreditCard className="h-4 w-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderInvoices = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">All Invoices</h3>
        <div className="flex space-x-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <motion.div
            key={invoice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{invoice.number}</h4>
                <p className="text-sm text-gray-500">{invoice.description}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">${invoice.amount.toLocaleString()}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
              <div>
                <span className="font-medium">Date:</span> {new Date(invoice.date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Due:</span> {new Date(invoice.dueDate).toLocaleDateString()}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <h5 className="font-medium text-gray-900 mb-2">Items:</h5>
              <div className="space-y-1">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.description} {item.hours && `(${item.hours}h @ $${item.rate}/h)`}
                    </span>
                    <span className="font-medium">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors flex items-center space-x-1"
              >
                <Download className="h-3 w-3" />
                <span>Download</span>
              </motion.button>
              {invoice.status === 'pending' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                >
                  <CreditCard className="h-3 w-3" />
                  <span>Pay Now</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderTimeTracking = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Time Entries</h3>
        <div className="text-right">
          <p className="text-sm text-gray-600">Unbilled Hours</p>
          <p className="text-2xl font-bold text-purple-600">{unbilledHours}</p>
        </div>
      </div>

      <div className="space-y-3">
        {timeEntries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">{entry.description}</span>
                <span className="text-sm text-gray-500">({entry.caseName})</span>
              </div>
              <p className="text-sm text-gray-600 ml-7">
                {new Date(entry.date).toLocaleDateString()} • {entry.hours}h @ ${entry.rate}/h
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">${(entry.hours * entry.rate).toLocaleString()}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                entry.billable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {entry.billable ? 'Billable' : 'Non-billable'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'time', label: 'Time Tracking', icon: Clock }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Invoices</h1>
        <p className="text-gray-600">Track your legal expenses and payment history</p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </motion.button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'invoices' && renderInvoices()}
        {activeTab === 'time' && renderTimeTracking()}
      </motion.div>
    </div>
  )
}

export default BillingView