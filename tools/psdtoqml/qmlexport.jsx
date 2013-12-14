/*
 * Crotocos::qmlexport.jsx
 */

// @include "qmlfile.jsx"
// @include "pngexport.jsx"

function QmlExport(path, document)
{
    this.path = path;
    this.document = document;
    
    // Класс для экспорта png-файлов
    this.pngExport = new PngExport(path, document);
    
    // Основной qmlfile
    var qmlfile = new QmlFile(this.path + "/main.qml");
    qmlfile.writeLine("import QtQuick 2.1");
    qmlfile.writeEmptyLine();
    qmlfile.startElement("Item");
        qmlfile.writeProperty("width", document.width.as("px"));
        qmlfile.writeProperty("height", document.height.as("px"));
        this.doExportLayers(qmlfile, this.document.layers);
    qmlfile.endElement();
}

QmlExport.prototype.doExportLayers = function(qmlfile, layers)
{
    var count = layers.length;
    for (var index  = 0; index < count; index++)
    {
        var layer = layers[index];
        if (layer.visible)
        {
            if(layer.typename == "LayerSet")
            {
                this.doExportLayerSet(qmlfile, layer);
            }
            else if(layer.typename == "ArtLayer")
            {
                this.doExportArtLayer(qmlfile, layer);
            }  
        }
    }
}

QmlExport.prototype.doExportLayerSet = function(qmlfile, layer)
{
    qmlfile.writeEmptyLine();
    qmlfile.startElementWithId("Item", layer.name);
    
    this.doExportLayers(qmlfile, layer.layers);
    
    qmlfile.endElement();
}

QmlExport.prototype.doExportArtLayer = function(qmlfile, layer)
{
    if (layer.kind !== undefined)
    {
        if (layer.kind == LayerKind.TEXT)
        {
            this.doExportText(qmlfile, layer);
            return;
        }
    }

    qmlfile.writeEmptyLine();
    qmlfile.startElementWithId("Image", layer.name);
 
    qmlfile.writeStringProperty("source", this.pngExport.save(layer));
    
    qmlfile.endElement();
}

QmlExport.prototype.doExportText = function(qmlfile, layer)
{
    qmlfile.writeEmptyLine();
    qmlfile.startElementWithId("Text", layer.name); 
        var textItem = layer.textItem;
        qmlfile.writeProperty("font", textItem.font);
        qmlfile.writeProperty("color", textItem.color);
        qmlfile.writeStringProperty("text", textItem.contents);
    qmlfile.endElement();
}
