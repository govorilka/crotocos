/*
 * Crotocos::psdlayerproxy.jsx
 */

function LayerProxy(layer)
{
    this.layer = layer;
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