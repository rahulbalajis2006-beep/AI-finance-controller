# AI Finance Controller Architecture

## Layers
1. **Layer A: Deterministic Truth Layer (TypeScript/Node):** Handles arithmetic, parsing, validation, and math.
2. **Layer B: Gemini Reasoning Layer:** Handles only unstructured reasoning for classifications.
3. **Layer C: Graceful Degradation:** Fails over cleanly.

## Why TypeScript instead of Python?
Node/TypeScript provides robust sandboxing in local environments and exact numerical precision while running perfectly alongside the UI React layer. This allows a seamless, single-command zero-cost local execution without requiring Python installations or cross-language IPC boundaries.
