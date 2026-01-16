---
trigger: always_on
---

These rules define the base execution layer that applies to every workflow run
and to every node added to the flow. All nodes, regardless of type, must conform
to this contract.

1. Shared Execution Context
- Each workflow run creates an isolated execution context.
- The execution context persists for the entire run.
- The context is immutable for past nodes and append-only for future nodes.

2. Node Output Propagation
- Every node execution produces a structured output object.
- Outputs are automatically merged into the execution context under:
  context.steps.<node_id>
- Outputs must be namespaced and never overwrite previous node outputs.

3. Input Resolution Rules
- Any node may declare inputs as:
  - Static values
  - References to previous node outputs
- Input references are resolved at runtime from the execution context.
- Only outputs from nodes that executed successfully may be referenced.

4. Dependency Ordering
- Nodes may only reference nodes that appear earlier in the execution graph.
- Forward references are not allowed.
- Cyclic dependencies are invalid and must be rejected at design time.

5. Input Compatibility
- Nodes must define an input schema.
- When referencing a previous node output:
  - Types must be compatible
  - Implicit stringification is allowed
  - Structural mismatches must be surfaced as configuration errors

6. Node-Agnostic Input Access
- All node types (HTTP, Browser Toast, File, Storage, etc.)
  must support dynamic inputs sourced from the execution context.
- Example:
  - HTTP body may reference file name from a Drive node
  - Toast message may reference response status from an HTTP node
- No node may restrict dynamic inputs unless technically impossible.

7. Execution Failure Handling
- If a node fails:
  - Its outputs are not written to the execution context
  - Downstream nodes referencing its outputs must fail fast
- Nodes may optionally declare "run on failure" behavior.

8. Deterministic Replays
- Given identical inputs and external responses,
  a workflow run must be replayable deterministically.
- Context snapshots may be stored per node execution.

9. Security & Isolation
- Execution contexts are isolated per workflow run.
- Node outputs cannot leak across runs or users.
- Secrets must never be written to the context in plain text.

10. Minimal Guarantees
- Every node must expose at least:
  - execution_status
  - execution_time
- Every node must support:
  - Dynamic input binding
  - Output exposure for downstream nodes

11. Design reuse
- Each new node that you add should use the same node design as the old node
  - Each node should be big ,black and have app name, app icon, id and the action name used. 
  - Also use the 3 dot menu in each node.