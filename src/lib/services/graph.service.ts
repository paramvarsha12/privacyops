import { System, DataFlow, BlastRadiusResult, DataAsset } from '../../types'
import { dataFlowRepository } from '../repositories/data-flow.repository'
import { systemRepository } from '../repositories/system.repository'
import { dataAssetRepository } from '../repositories/data-asset.repository'

// Graph service for data lineage and blast radius calculation
// Uses BFS/DFS to traverse the data flow graph

export class GraphService {
  /**
   * Build an adjacency list representation of the data flow graph
   */
  private async buildAdjacencyList(organizationId: string): Promise<Map<string, string[]>> {
    const dataFlows = await dataFlowRepository.findByOrganization(organizationId)
    const adjacencyList = new Map<string, string[]>()

    for (const flow of dataFlows) {
      const sourceId = flow.source_system_id
      const destId = flow.destination_system_id

      if (!adjacencyList.has(sourceId)) {
        adjacencyList.set(sourceId, [])
      }
      adjacencyList.get(sourceId)!.push(destId)
    }

    return adjacencyList
  }

  /**
   * Build a reverse adjacency list for upstream traversal
   */
  private async buildReverseAdjacencyList(organizationId: string): Promise<Map<string, string[]>> {
    const dataFlows = await dataFlowRepository.findByOrganization(organizationId)
    const reverseAdjacencyList = new Map<string, string[]>()

    for (const flow of dataFlows) {
      const sourceId = flow.source_system_id
      const destId = flow.destination_system_id

      if (!reverseAdjacencyList.has(destId)) {
        reverseAdjacencyList.set(destId, [])
      }
      reverseAdjacencyList.get(destId)!.push(sourceId)
    }

    return reverseAdjacencyList
  }

  /**
   * Get all downstream systems from a starting system using BFS
   */
  async getDownstreamSystems(
    organizationId: string,
    startSystemId: string
  ): Promise<System[]> {
    const adjacencyList = await this.buildAdjacencyList(organizationId)
    const visited = new Set<string>()
    const queue: string[] = [startSystemId]
    const downstreamIds: string[] = []

    visited.add(startSystemId)

    while (queue.length > 0) {
      const currentId = queue.shift()!

      const neighbors = adjacencyList.get(currentId) || []
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId)
          downstreamIds.push(neighborId)
          queue.push(neighborId)
        }
      }
    }

    // Fetch system details
    const systems: System[] = []
    for (const systemId of downstreamIds) {
      const system = await systemRepository.findById(systemId)
      if (system) {
        systems.push(system)
      }
    }

    return systems
  }

  /**
   * Get all upstream systems from a starting system using BFS
   */
  async getUpstreamSystems(
    organizationId: string,
    startSystemId: string
  ): Promise<System[]> {
    const reverseAdjacencyList = await this.buildReverseAdjacencyList(organizationId)
    const visited = new Set<string>()
    const queue: string[] = [startSystemId]
    const upstreamIds: string[] = []

    visited.add(startSystemId)

    while (queue.length > 0) {
      const currentId = queue.shift()!

      const neighbors = reverseAdjacencyList.get(currentId) || []
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId)
          upstreamIds.push(neighborId)
          queue.push(neighborId)
        }
      }
    }

    // Fetch system details
    const systems: System[] = []
    for (const systemId of upstreamIds) {
      const system = await systemRepository.findById(systemId)
      if (system) {
        systems.push(system)
      }
    }

    return systems
  }

  /**
   * Calculate blast radius for a data asset
   * This determines which systems are affected if this asset is modified/deleted
   */
  async calculateBlastRadius(
    organizationId: string,
    dataAssetId: string
  ): Promise<BlastRadiusResult> {
    const dataAsset = await dataAssetRepository.findById(dataAssetId)
    if (!dataAsset) {
      throw new Error('Data asset not found')
    }

    const sourceSystemId = dataAsset.system_id

    // Get all data flows involving this asset
    const relatedFlows = await dataFlowRepository.findByDataAsset(dataAssetId)

    // Get direct dependencies (systems that directly receive this asset)
    const directDependencyIds = new Set<string>()
    for (const flow of relatedFlows) {
      if (flow.source_system_id === sourceSystemId) {
        directDependencyIds.add(flow.destination_system_id)
      }
    }

    const directDependencies: System[] = []
    for (const systemId of directDependencyIds) {
      const system = await systemRepository.findById(systemId)
      if (system) {
        directDependencies.push(system)
      }
    }

    // Get all downstream systems (transitive closure)
    const allDownstream = await this.getDownstreamSystems(organizationId, sourceSystemId)

    // Separate direct from indirect dependencies
    const directIds = new Set(directDependencies.map(s => s.id))
    const indirectDependencies = allDownstream.filter(
      system => !directIds.has(system.id)
    )

    // Get affected assets in downstream systems
    const affectedAssets: DataAsset[] = []
    for (const system of allDownstream) {
      const assets = await dataAssetRepository.findBySystem(system.id)
      affectedAssets.push(...assets)
    }

    // Calculate depth (longest path from source)
    const depth = await this.calculateMaxDepth(organizationId, sourceSystemId)

    return {
      affected_systems: allDownstream,
      direct_dependencies: directDependencies,
      indirect_dependencies: indirectDependencies,
      depth,
      affected_assets: affectedAssets
    }
  }

  /**
   * Calculate the maximum depth from a starting system
   */
  private async calculateMaxDepth(
    organizationId: string,
    startSystemId: string
  ): Promise<number> {
    const adjacencyList = await this.buildAdjacencyList(organizationId)
    const visited = new Map<string, number>() // systemId -> depth
    const queue: { systemId: string; depth: number }[] = [
      { systemId: startSystemId, depth: 0 }
    ]

    visited.set(startSystemId, 0)
    let maxDepth = 0

    while (queue.length > 0) {
      const { systemId, depth } = queue.shift()!
      maxDepth = Math.max(maxDepth, depth)

      const neighbors = adjacencyList.get(systemId) || []
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.set(neighborId, depth + 1)
          queue.push({ systemId: neighborId, depth: depth + 1 })
        }
      }
    }

    return maxDepth
  }

  /**
   * Get the complete graph structure for visualization
   */
  async getGraphStructure(organizationId: string): Promise<{
    nodes: Array<{ id: string; label: string; type: string; status: string }>;
    edges: Array<{ source: string; target: string; label?: string }>;
  }> {
    const systems = await systemRepository.findByOrganization(organizationId)
    const dataFlows = await dataFlowRepository.findByOrganization(organizationId)

    const nodes = systems.map((system: System) => ({
      id: system.id,
      label: system.name,
      type: system.type,
      status: system.status
    }))

    const edges = dataFlows.map((flow: DataFlow) => ({
      source: flow.source_system_id,
      target: flow.destination_system_id,
      label: flow.relationship_type
    }))

    return { nodes, edges }
  }

  /**
   * Find the shortest path between two systems using BFS
   */
  async findShortestPath(
    organizationId: string,
    fromSystemId: string,
    toSystemId: string
  ): Promise<string[] | null> {
    const adjacencyList = await this.buildAdjacencyList(organizationId)
    const visited = new Map<string, string>() // child -> parent
    const queue: string[] = [fromSystemId]

    visited.set(fromSystemId, '')

    while (queue.length > 0) {
      const currentId = queue.shift()!

      if (currentId === toSystemId) {
        // Reconstruct path
        const path: string[] = []
        let current = toSystemId
        while (current !== fromSystemId) {
          path.unshift(current)
          current = visited.get(current)!
        }
        path.unshift(fromSystemId)
        return path
      }

      const neighbors = adjacencyList.get(currentId) || []
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.set(neighborId, currentId)
          queue.push(neighborId)
        }
      }
    }

    return null // No path found
  }
}

export const graphService = new GraphService()
