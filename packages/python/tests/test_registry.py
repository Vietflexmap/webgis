from vietflex.webgis import LayerDefinition, LayerRegistry


def test_registry_filters_disabled_layers() -> None:
    registry = LayerRegistry(
        [
            LayerDefinition(key="a", query_layer_id="a-layer"),
            LayerDefinition(key="b", query_layer_id="b-layer", enabled=False),
        ]
    )
    assert registry.query_layer_ids() == ["a-layer"]
