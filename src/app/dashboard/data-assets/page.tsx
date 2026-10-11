'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Database, Shield, TrendingUp } from 'lucide-react'
import { DataAsset, Classification } from '@/types'

// Mock data for demo - in production this would come from the API
const mockDataAssets: DataAsset[] = [
  {
    id: '1',
    organization_id: 'org-1',
    system_id: 'sys-1',
    name: 'customer_email',
    display_name: 'Customer Email',
    description: 'Customer email address',
    classification: 'PERSONAL',
    sensitivity: 'MEDIUM',
    owner: 'Engineering',
    risk_level: 'MEDIUM',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    organization_id: 'org-1',
    system_id: 'sys-1',
    name: 'customer_name',
    display_name: 'Customer Name',
    description: 'Customer full name',
    classification: 'PERSONAL',
    sensitivity: 'LOW',
    owner: 'Engineering',
    risk_level: 'LOW',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    organization_id: 'org-1',
    system_id: 'sys-1',
    name: 'phone_number',
    display_name: 'Phone Number',
    description: 'Customer phone number',
    classification: 'PERSONAL',
    sensitivity: 'MEDIUM',
    owner: 'Engineering',
    risk_level: 'MEDIUM',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '4',
    organization_id: 'org-1',
    system_id: 'sys-1',
    name: 'billing_address',
    display_name: 'Billing Address',
    description: 'Customer billing address',
    classification: 'PERSONAL',
    sensitivity: 'MEDIUM',
    owner: 'Finance',
    risk_level: 'MEDIUM',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '5',
    organization_id: 'org-1',
    system_id: 'sys-1',
    name: 'payment_reference',
    display_name: 'Payment Reference',
    description: 'Payment method reference',
    classification: 'FINANCIAL',
    sensitivity: 'HIGH',
    owner: 'Finance',
    risk_level: 'HIGH',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '6',
    organization_id: 'org-1',
    system_id: 'sys-1',
    name: 'marketing_consent',
    display_name: 'Marketing Consent',
    description: 'Marketing consent status',
    classification: 'PERSONAL',
    sensitivity: 'LOW',
    owner: 'Marketing',
    risk_level: 'LOW',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '7',
    organization_id: 'org-1',
    system_id: 'sys-5',
    name: 'support_ticket',
    display_name: 'Support Ticket',
    description: 'Customer support ticket data',
    classification: 'PERSONAL',
    sensitivity: 'MEDIUM',
    owner: 'Support',
    risk_level: 'MEDIUM',
    created_at: '2024-01-18T00:00:00Z',
    updated_at: '2024-01-18T00:00:00Z'
  }
]

const classificationColors: Record<Classification, string> = {
  PERSONAL: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  SENSITIVE: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  FINANCIAL: 'bg-red-500/10 text-red-500 border-red-500/20',
  CREDENTIAL: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  PUBLIC: 'bg-green-500/10 text-green-500 border-green-500/20',
  UNKNOWN: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
}

const sensitivityColors: Record<string, string> = {
  LOW: 'bg-green-500/10 text-green-500',
  MEDIUM: 'bg-amber-500/10 text-amber-500',
  HIGH: 'bg-orange-500/10 text-orange-500',
  CRITICAL: 'bg-red-500/10 text-red-500'
}

export default function DataAssetsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<DataAsset | null>(null)
  const [filteredAssets, setFilteredAssets] = useState<DataAsset[]>(mockDataAssets)

  useEffect(() => {
    if (searchTerm) {
      const filtered = mockDataAssets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredAssets(filtered)
    } else {
      setFilteredAssets(mockDataAssets)
    }
  }, [searchTerm])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Assets</h1>
        <p className="text-zinc-400">Manage and monitor personal data across your systems</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Assets</CardTitle>
            <Database className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDataAssets.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">High Risk</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {mockDataAssets.filter(a => a.risk_level === 'HIGH' || a.risk_level === 'CRITICAL').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Financial Data</CardTitle>
            <Shield className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDataAssets.filter(a => a.classification === 'FINANCIAL').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Systems</CardTitle>
            <Database className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search data assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800"
          />
        </div>
      </div>

      {/* Data Assets Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>All Data Assets</CardTitle>
          <CardDescription>Personal data discovered across your systems</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Sensitivity</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{asset.display_name}</div>
                      <div className="text-sm text-zinc-400">{asset.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={classificationColors[asset.classification]}>
                      {asset.classification}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={sensitivityColors[asset.sensitivity]}>
                      {asset.sensitivity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={sensitivityColors[asset.risk_level]}>
                      {asset.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell>{asset.owner}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-zinc-900 border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedAsset.display_name}</CardTitle>
                  <CardDescription>{selectedAsset.name}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAsset(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-zinc-400">{selectedAsset.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Classification</h3>
                  <Badge className={classificationColors[selectedAsset.classification]}>
                    {selectedAsset.classification}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Sensitivity</h3>
                  <Badge className={sensitivityColors[selectedAsset.sensitivity]}>
                    {selectedAsset.sensitivity}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Risk Level</h3>
                  <Badge className={sensitivityColors[selectedAsset.risk_level]}>
                    {selectedAsset.risk_level}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Owner</h3>
                  <p className="text-sm text-zinc-400">{selectedAsset.owner}</p>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-6">
                <h3 className="font-semibold mb-4">Data Lineage</h3>
                <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                  <div className="text-sm text-zinc-400 mb-3">
                    This asset flows through the following systems:
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-cyan-500" />
                      <span className="text-sm">Customer Database (Source)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-zinc-500" />
                      <span className="text-sm">CRM (Direct)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-zinc-500" />
                      <span className="text-sm">Marketing Platform (Downstream)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-zinc-500" />
                      <span className="text-sm">Email Provider (Downstream)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-6">
                <h3 className="font-semibold mb-4">Blast Radius</h3>
                <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-cyan-500">4</div>
                      <div className="text-sm text-zinc-400">Systems Affected</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-cyan-500">2</div>
                      <div className="text-sm text-zinc-400">Downstream Depth</div>
                    </div>
                  </div>
                  <Button className="w-full">
                    View in Data Map
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
