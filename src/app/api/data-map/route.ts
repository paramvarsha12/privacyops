import { NextResponse } from 'next/server'
import { privacyStore } from '@/lib/store/privacy-store'

export async function GET() {
  try {
    const systems = privacyStore.getSystems()
    const flows = privacyStore.getDataFlows()
    const assets = privacyStore.getDataAssets()

    const nodes = systems.map(s => ({
      id: s.id,
      label: s.name,
      type: s.type,
      status: s.status,
      connector: s.connector_type,
      simulate_failure: s.simulate_failure,
      asset_count: assets.filter(a => a.system_id === s.id).length
    }))

    const edges = flows.map(f => {
      const source = systems.find(s => s.id === f.source_system_id)
      const target = systems.find(s => s.id === f.destination_system_id)
      return {
        id: f.id,
        source: f.source_system_id,
        target: f.destination_system_id,
        source_name: source?.name || 'Unknown',
        target_name: target?.name || 'Unknown',
        type: f.relationship_type,
        description: f.description
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        nodes,
        edges,
        total_systems: nodes.length,
        total_flows: edges.length,
        max_depth: 3
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch data map' },
      { status: 500 }
    )
  }
}
