"""Server-side representation of WebGIS layer definitions."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class LayerDefinition:
    key: str
    query_layer_id: str
    selected_layer_id: str | None = None
    id_property: str = "gid"
    request_param: str = "gid"
    enabled: bool = True
    endpoints: dict[str, str] = field(default_factory=dict)
    metadata: dict[str, object] = field(default_factory=dict)


class LayerRegistry:
    def __init__(self, initial: list[LayerDefinition] | None = None) -> None:
        self._layers: dict[str, LayerDefinition] = {}
        for definition in initial or []:
            self.register(definition)

    def register(self, definition: LayerDefinition) -> None:
        if not definition.key.strip():
            raise ValueError("Layer key is required")
        if not definition.query_layer_id.strip():
            raise ValueError("query_layer_id is required")
        self._layers[definition.key] = definition

    def get(self, key: str) -> LayerDefinition | None:
        return self._layers.get(key)

    def enabled(self) -> list[LayerDefinition]:
        return [layer for layer in self._layers.values() if layer.enabled]

    def query_layer_ids(self) -> list[str]:
        return [layer.query_layer_id for layer in self.enabled()]
