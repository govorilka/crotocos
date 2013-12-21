/*
 * Crotocos::psdlayerproxy.jsx
 */

function LayerProxy(parent, layer)
{
    this.parent = parent;
    this.layer = layer;
    
    var parentX = 0;
    var parentY = 0;
    if (this.parent !== undefined)
    {
        parentX = this.parent.documentX;
        parentY = this.parent.documentY;
    }

    this.documentX = 0;
    this.documentY = 0;
    this.width = 0;
    this.height = 0;

    var bounds = this.layer.bounds;
    if (bounds !== undefined)
    {
       this.documentX = bounds[0].as("px");
       this.documentY = bounds[1].as("px");
       this.width = bounds[2].as("px") - bounds[0].as("px");
       this.height = bounds[3].as("px") - bounds[1].as("px");
    }

    this.x = this.documentX - parentX;
    this.y = this.documentY - parentY;
}

LayerProxy.prototype.qmlType = function()
{
    if(this.layer.typename == "LayerSet")
    {
        return "Item";
    }


    if(this.layer.typename == "ArtLayer" && this.layer.kind !== undefined)
    {
        switch(this.layer.kind)
        {
        case LayerKind.TEXT:
            return "Text";
        }
    }

    // По умолчанию все слои будем сохранять, как картинки
    return "Image";
}
