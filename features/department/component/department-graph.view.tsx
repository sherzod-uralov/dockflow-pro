
"use client"

import React, { useState, useCallback, useEffect } from "react"
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    Position,
    ConnectionMode,
    Connection,
    BackgroundVariant,
    Handle,
} from "reactflow"
import "reactflow/dist/style.css"
import {
    Box,
    Paper,
    Text,
    Group,
    Badge,
    Avatar,
    ActionIcon,
    Tooltip,
    Stack,
    Button,
    Modal,
    Center,
    ThemeIcon, // Added ThemeIcon
} from "@mantine/core"
import { useDisclosure, useFullscreen } from "@mantine/hooks" // Added useDisclosure and useFullscreen
import {
    IconBuilding,
    IconEdit,
    IconTrash,
    IconUsers,
    IconX,
    IconUnlink,
} from "@tabler/icons-react"

import { DepartmentResponse } from "../type/department.type";
import { colors } from "@/lib/colors";

interface DepartmentGraphViewProps {
    departments: DepartmentResponse[]
    onEdit?: (dept: DepartmentResponse) => void
    onDelete?: (dept: DepartmentResponse) => void
    onView?: (dept: DepartmentResponse) => void
    onViewUsers?: (dept: DepartmentResponse) => void
    onConnectDepartments?: (targetId: string, parentId: string) => void
    onDisconnectDepartment?: (id: string) => void
}

// Custom Department Node Component
function DepartmentNode({ data, isConnectable }: { data: any; isConnectable: boolean }) {
    const dept = data.department
    const isRoot = !dept.parent

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const handleStyle = {
        width: 16,
        height: 16,
        borderRadius: "50%",
        backgroundColor: colors.info,
        border: "3px solid white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        zIndex: 100, // Ensure handles are above the card
    }

    return (
        <>
            {/* Source Handles */}
            <Handle
                type="source"
                position={Position.Top}
                id="top"
                isConnectable={isConnectable}
                style={{ ...handleStyle, top: -8 }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                isConnectable={isConnectable}
                style={{ ...handleStyle, right: -8 }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                isConnectable={isConnectable}
                style={{ ...handleStyle, bottom: -8 }}
            />
            <Handle
                type="source"
                position={Position.Left}
                id="left"
                isConnectable={isConnectable}
                style={{ ...handleStyle, left: -8 }}
            />

            {/* Target Handles */}
            <Handle
                type="target"
                position={Position.Top}
                id="target-top"
                isConnectable={isConnectable}
                style={{ ...handleStyle, top: -8 }}
            />
            <Handle
                type="target"
                position={Position.Right}
                id="target-right"
                isConnectable={isConnectable}
                style={{ ...handleStyle, right: -8 }}
            />
            <Handle
                type="target"
                position={Position.Bottom}
                id="target-bottom"
                isConnectable={isConnectable}
                style={{ ...handleStyle, bottom: -8 }}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="target-left"
                isConnectable={isConnectable}
                style={{ ...handleStyle, left: -8 }}
            />

            <Paper
                p="md"
                radius="md"
                withBorder
                shadow="lg"
                style={{
                    borderColor: isRoot ? colors.primary : colors.borderLight,
                    borderWidth: isRoot ? 2 : 1,
                    backgroundColor: "white",
                    width: 320,
                    cursor: "grab",
                    position: "relative",
                    zIndex: 10,
                }}
            >
                <Stack gap="sm">
                    {/* Header */}
                    <Group gap="xs" wrap="nowrap">
                        <Box
                            style={{
                                background: isRoot
                                    ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`
                                    : `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.infoBg} 100%)`,
                                padding: 10,
                                borderRadius: 10,
                                flexShrink: 0,
                            }}
                        >
                            <IconBuilding size={20} color={isRoot ? "white" : colors.primary} />
                        </Box>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text size="sm" fw={600} c={colors.textPrimary} lineClamp={1}>
                                {dept.name}
                            </Text>
                            {dept.code && (
                                <Badge variant="light" color="blue" size="xs" radius="sm" mt={2}>
                                    {dept.code}
                                </Badge>
                            )}
                        </Box>
                    </Group>

                    {/* Director */}
                    {dept.director && (
                        <Group
                            gap="xs"
                            wrap="nowrap"
                            p="xs"
                            style={{
                                backgroundColor: colors.bg,
                                borderRadius: 6,
                            }}
                        >
                            <Avatar
                                size="sm"
                                radius="xl"
                                src={dept.director.avatarUrl}
                                style={{
                                    backgroundColor: colors.primaryLight,
                                    flexShrink: 0,
                                }}
                            >
                                <Text size="xs" c={colors.primary} fw={600}>
                                    {getInitials(dept.director.fullname)}
                                </Text>
                            </Avatar>
                            <Box style={{ flex: 1, minWidth: 0 }}>
                                <Text size="xs" c="dimmed" fw={500}>
                                    Bo'lim boshlig'i
                                </Text>
                                <Text size="xs" c={colors.textPrimary} fw={500} lineClamp={1}>
                                    {dept.director.fullname}
                                </Text>
                            </Box>
                        </Group>
                    )}

                    {/* Location */}
                    {dept.location && (
                        <Group
                            gap={4}
                            p={4}
                            style={{
                                backgroundColor: colors.warningLight,
                                borderRadius: 4,
                            }}
                        >
                            <Text size="xs">📍</Text>
                            <Text size="xs" c={colors.textSecondary} fw={500} lineClamp={1}>
                                {dept.location}
                            </Text>
                        </Group>
                    )}

                    {/* Actions */}
                    <Group gap={4} justify="center" mt={4}>
                        {data.onViewUsers && (
                            <Tooltip label="Foydalanuvchilar">
                                <ActionIcon
                                    variant="light"
                                    color="blue"
                                    size="sm"
                                    radius="md"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        data.onViewUsers(dept)
                                    }}
                                >
                                    <IconUsers size={16} />
                                </ActionIcon>
                            </Tooltip>
                        )}
                        {dept.parent && data.onDisconnectDepartment && (
                            <Tooltip label="Bog'lanishni uzish">
                                <ActionIcon
                                    variant="light"
                                    color="orange"
                                    size="sm"
                                    radius="md"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        data.onDisconnectDepartment(dept.id)
                                    }}
                                >
                                    <IconUnlink size={16} />
                                </ActionIcon>
                            </Tooltip>
                        )}
                        {data.onEdit && (
                            <Tooltip label="Tahrirlash">
                                <ActionIcon
                                    variant="light"
                                    color="blue"
                                    size="sm"
                                    radius="md"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        data.onEdit(dept)
                                    }}
                                >
                                    <IconEdit size={16} />
                                </ActionIcon>
                            </Tooltip>
                        )}
                        {data.onDelete && (
                            <Tooltip label="O'chirish">
                                <ActionIcon
                                    variant="light"
                                    color="red"
                                    size="sm"
                                    radius="md"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        data.onDelete(dept)
                                    }}
                                >
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </Group>
                </Stack>
            </Paper>
        </>
    )
}

const nodeTypes = {
    department: DepartmentNode,
}

export default function DepartmentGraphView({
    departments,
    onEdit,
    onDelete,
    onView,
    onViewUsers,
    onConnectDepartments,
    onDisconnectDepartment,
}: DepartmentGraphViewProps) {
    const { ref, toggle, fullscreen } = useFullscreen();
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [connectModalOpen, setConnectModalOpen] = useState(false)
    const [selectedConnection, setSelectedConnection] = useState<{
        source: string
        target: string
    } | null>(null)

    const CARD_WIDTH = 320
    const CARD_HEIGHT = 250
    const HORIZONTAL_GAP = 150
    const VERTICAL_GAP = 150

    // Calculate hierarchical layout
    useEffect(() => {
        if (!departments || departments.length === 0) {
            setNodes([])
            setEdges([])
            return
        }

        // Build hierarchy map
        const deptMap = new Map<string, DepartmentResponse>()
        const childrenMap = new Map<string, string[]>()

        // Initialize children map
        departments.forEach((dept) => {
            deptMap.set(dept.id, dept)
            childrenMap.set(dept.id, [])
        })

        // Populate children and find initial roots
        const possibleRoots = new Set<string>(departments.map(d => d.id))

        departments.forEach((dept) => {
            if (dept.parent && deptMap.has(dept.parent.id)) {
                const children = childrenMap.get(dept.parent.id)
                if (children) {
                    children.push(dept.id)
                }
                // If it has a parent, it's not a root candidate initially
                possibleRoots.delete(dept.id)
            }
        })

        // -- Cycle Handling & Root Selection --
        const finalRoots: string[] = Array.from(possibleRoots)

        // If we have nodes but no roots, we have a complete cycle (e.g. A->B->A).
        // Or if we have disconnected subgraphs that are cycles.
        // We need to ensure every node is reachable from finalRoots.

        const visitedGlobal = new Set<string>()

        // Helper to mark reachable nodes
        const markReachable = (nodeId: string) => {
            if (visitedGlobal.has(nodeId)) return
            visitedGlobal.add(nodeId)
            const children = childrenMap.get(nodeId) || []
            children.forEach(markReachable)
        }

        finalRoots.forEach(markReachable)

        // If there are unvisited nodes, pick one as a forced root and repeat
        // This handles cycles by arbitrarily breaking them for visualization
        departments.forEach((dept) => {
            if (!visitedGlobal.has(dept.id)) {
                // This node is part of a cycle or unreachable component
                finalRoots.push(dept.id)
                markReachable(dept.id)
            }
        })

        // -- Improved Tree Layout Algorithm (Safe for Cycles) --

        const subtreeWidths = new Map<string, number>()
        // Track nodes in current recursion stack to detect back-edges (cycles)
        const recursionStack = new Set<string>()

        // 1. Calculate width of each subtree (Post-order traversal)
        const calculateSubtreeWidth = (nodeId: string): number => {
            // If we hit a node currently in recursion stack, treat it as a leaf (width = CARD_WIDTH)
            // to break infinite loop
            if (recursionStack.has(nodeId)) {
                return CARD_WIDTH
            }

            // Memoization check handles DAGs, but here mainly for performance
            if (subtreeWidths.has(nodeId)) {
                return subtreeWidths.get(nodeId)!
            }

            recursionStack.add(nodeId)

            const children = childrenMap.get(nodeId) || []

            if (children.length === 0) {
                const width = CARD_WIDTH
                subtreeWidths.set(nodeId, width)
                recursionStack.delete(nodeId)
                return width
            }

            let totalChildrenWidth = 0
            children.forEach((childId, index) => {
                // IMPORTANT: If child is ancestor (cycle), skip its width calculation contribution
                // effectively treating that link as non-structural for width
                if (!recursionStack.has(childId)) {
                    const childWidth = calculateSubtreeWidth(childId)
                    totalChildrenWidth += childWidth
                    if (index < children.length - 1) {
                        totalChildrenWidth += HORIZONTAL_GAP
                    }
                }
            })

            const width = Math.max(CARD_WIDTH, totalChildrenWidth)
            subtreeWidths.set(nodeId, width)
            recursionStack.delete(nodeId)
            return width
        }

        finalRoots.forEach(calculateSubtreeWidth)

        // 2. Assign positions (Pre-order traversal)
        const positions = new Map<string, { x: number; y: number }>()
        const positionedNodes = new Set<string>()

        const assignPositions = (nodeId: string, x: number, y: number) => {
            if (positionedNodes.has(nodeId)) return
            positionedNodes.add(nodeId)

            positions.set(nodeId, { x, y })

            const children = childrenMap.get(nodeId) || []
            if (children.length === 0) return

            // Filter children to avoid following back-edges in cycles 
            // (only follow if not yet positioned)
            const validChildren = children.filter(c => !positionedNodes.has(c))

            if (validChildren.length === 0) return

            let totalChildrenWidth = 0
            validChildren.forEach((childId, idx) => {
                totalChildrenWidth += subtreeWidths.get(childId) || CARD_WIDTH
                if (idx < validChildren.length - 1) totalChildrenWidth += HORIZONTAL_GAP
            })

            let startX = x - totalChildrenWidth / 2

            validChildren.forEach((childId) => {
                const childWidth = subtreeWidths.get(childId) || CARD_WIDTH
                const childX = startX + childWidth / 2

                assignPositions(childId, childX, y + CARD_HEIGHT + VERTICAL_GAP)

                startX += childWidth + HORIZONTAL_GAP
            })
        }

        // Layout roots side-by-side
        let rootsTotalWidth = 0
        finalRoots.forEach((rootId, idx) => {
            rootsTotalWidth += subtreeWidths.get(rootId) || CARD_WIDTH
            if (idx < finalRoots.length - 1) rootsTotalWidth += HORIZONTAL_GAP
        })

        let currentRootX = 0 - rootsTotalWidth / 2

        finalRoots.forEach((rootId) => {
            const rootWidth = subtreeWidths.get(rootId) || CARD_WIDTH
            const rootX = currentRootX + rootWidth / 2

            assignPositions(rootId, rootX, 100)

            currentRootX += rootWidth + HORIZONTAL_GAP
        })

        // Create nodes
        const newNodes: Node[] = Array.from(deptMap.values()).map((dept) => {
            const pos = positions.get(dept.id) || { x: 0, y: 0 }
            return {
                id: dept.id,
                type: "department",
                position: pos,
                data: {
                    department: dept,
                    onEdit,
                    onDelete,
                    onView,
                    onViewUsers,
                    onDisconnectDepartment,
                },
                draggable: true,
                selectable: true,
                connectable: true,
            }
        })

        // Create edges
        const newEdges: Edge[] = departments
            .filter((dept) => dept.parent)
            .map((dept) => ({
                id: `${dept.parent!.id} -${dept.id} `,
                source: dept.parent!.id,
                target: dept.id,
                type: "step",
                sourceHandle: "bottom",
                targetHandle: "target-top",
                animated: false,
                style: { stroke: colors.primary, strokeWidth: 2 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: colors.primary,
                },
            }))

        setNodes(newNodes)
        setEdges(newEdges)
    }, [departments, onEdit, onDelete, onView, onViewUsers, onDisconnectDepartment])

    const onConnect = useCallback(
        (params: Connection) => {

            if (params.source && params.target) {
                // Check if connection already exists
                const connectionExists = edges.some(
                    (edge) => edge.source === params.source && edge.target === params.target
                )


                if (!connectionExists) {
                    setSelectedConnection({
                        source: params.source,
                        target: params.target,
                    })
                    setConnectModalOpen(true)
                }
            }
        },
        [edges, onConnectDepartments]
    )

    const handleConnectConfirm = () => {
        if (selectedConnection && onConnectDepartments) {
            // target node gets the source node as parent
            // target = child, source = parent
            onConnectDepartments(selectedConnection.target, selectedConnection.source)

            // Close modal
            setConnectModalOpen(false)
            setSelectedConnection(null)
        }
    }

    const getNodeName = (id: string) => {
        const node = nodes.find((n) => n.id === id)
        return node?.data?.department?.name || ""
    }
    if (!departments || departments.length === 0) {
        return (
            <Paper p="xl" radius="sm" withBorder style={{ borderColor: colors.border, minHeight: 500 }}>
                <Center h={400}>
                    <Text c="dimmed">Bo'limlar mavjud emas</Text>
                </Center>
            </Paper >
        )
    }

    return (
        <>
            <Paper
                radius="sm"
                withBorder
                style={{
                    height: 700,
                    borderColor: colors.border,
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    connectionMode={ConnectionMode.Loose}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    minZoom={0.4}
                    maxZoom={2}
                    connectionLineStyle={{
                        stroke: colors.info,
                        strokeWidth: 3,
                    }}
                    defaultEdgeOptions={{
                        type: "smoothstep",
                        animated: false,
                        style: { stroke: colors.primary, strokeWidth: 2 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: colors.primary,
                        },
                    }}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        color={colors.border}
                    />
                    <Controls
                        showInteractive={false}
                    />
                </ReactFlow>
            </Paper>

            {/* Connection Confirmation Modal */}
            <Modal
                opened={connectModalOpen}
                onClose={() => {
                    setConnectModalOpen(false)
                    setSelectedConnection(null)
                }}
                title={
                    <Group gap="xs">
                        <IconBuilding size={20} color={colors.primary} />
                        <Text fw={600} size="lg">
                            Bo'limni bog'lash
                        </Text>
                    </Group>
                }
                size="md"
                centered
            >
                <Stack gap="md">
                    {selectedConnection && (
                        <>
                            <Text size="sm" c="dimmed">
                                <strong>{getNodeName(selectedConnection.target)}</strong> bo'limini{" "}
                                <strong>{getNodeName(selectedConnection.source)}</strong> bo'limiga
                                bog'lamoqchimisiz?
                            </Text>

                            <Group justify="space-between" mt="md">
                                <Button
                                    variant="subtle"
                                    color="gray"
                                    onClick={() => {
                                        setConnectModalOpen(false)
                                        setSelectedConnection(null)
                                    }}
                                    leftSection={<IconX size={16} />}
                                >
                                    Bekor qilish
                                </Button>
                                <Button onClick={handleConnectConfirm} style={{ backgroundColor: colors.primary }}>
                                    Tasdiqlash
                                </Button>
                            </Group>
                        </>
                    )}
                </Stack>
            </Modal>
        </>
    )
}