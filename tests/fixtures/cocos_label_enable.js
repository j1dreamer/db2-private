// Original Cocos engine Label.onEnable (module 108), used to exercise creation order.
(function() {
this._super();
this.node.on(cc.Node.EventType.SIZE_CHANGED, this._nodeSizeChanged, this);
this.node.on(cc.Node.EventType.ANCHOR_CHANGED, this.setVertsDirty, this);
this.node.on(cc.Node.EventType.COLOR_CHANGED, this._nodeColorChanged, this);
this._forceUpdateRenderData();
})
